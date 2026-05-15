import { db } from "@e-service/db";
import { and, count, eq, or } from "@e-service/db/drizzle/orm";
import {
  catalog,
  catalogPoint,
  catalogSubCatalog,
} from "@e-service/db/schema/service/catalog";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { deleteFile, uploadFile } from "@e-service/storage";
import { generateKey } from "@e-service/storage/utils";
import { ORPCError } from "@orpc/server";
import type { Context } from "../../context";
import { CATALOG_SORT_FIELDS } from "../../schema/service/catalog";
import type {
  CatalogIdInput,
  CreateCatalogInput,
  ListCatalogsInput,
  UpdateCatalogInput,
} from "../../types/service/catalog";
import { buildWhereClause } from "../../utils/filter";
import { buildOrderBy } from "../../utils/sort";

const withNested = {
  points: {
    columns: {
      id: true,
      text: true,
      textAr: true,
      order: true,
    },
  },
  subCatalogs: {
    columns: {
      catalogId: false,
      createdAt: false,
      updatedAt: false,
    },
    with: {
      points: {
        columns: { id: true, text: true, textAr: true, order: true },
      },
    },
  },
} as const;

export const listCatalogs = async ({ input }: { input: ListCatalogsInput }) => {
  const { page, limit, filter, filterCondition, sort, withoutPagination } =
    input;

  const conditions = filter
    ? [
        buildWhereClause(catalog.serviceId, filter.serviceId),
        buildWhereClause(catalog.heading, filter.heading),
        buildWhereClause(catalog.headingAr, filter.headingAr),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.catalog.findMany({
      where,
      with: withNested,
      orderBy: (c) =>
        buildOrderBy(c, sort, CATALOG_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
    });
    return {
      data: rows,
      total: rows.length,
      totalPages: 1,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
    };
  }

  const offset = (page - 1) * limit;

  const [rows, [total]] = await Promise.all([
    db.query.catalog.findMany({
      where,
      with: withNested,
      orderBy: (c) =>
        buildOrderBy(c, sort, CATALOG_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(catalog).where(where),
  ]);

  const totalPages = Math.ceil((total?.value ?? 0) / limit);

  return {
    data: rows,
    total: total?.value ?? 0,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

export const getCatalog = async ({ input }: { input: CatalogIdInput }) => {
  const found = await db.query.catalog.findFirst({
    where: eq(catalog.id, input.id),
    columns: {
      createdAt: false,
      updatedAt: false,
      serviceId: false,
    },
    with: withNested,
  });
  if (!found)
    throw new ORPCError("NOT_FOUND", { message: "Catalog not found" });
  return { catalog: found };
};

export const createCatalog = async ({
  input,
  context,
}: {
  input: CreateCatalogInput;
  context: Context;
}) => {
  const { logo, points, subCatalogs, ...catalogData } = input;

  let key = logo ? generateKey(logo, "catalog") : undefined;

  if (logo && key) {
    const { data: uploaded } = await tryCatch(
      uploadFile(key, logo, {
        contentType: logo.type || undefined,
        metadata: { originalName: logo.name },
      }),
    );
    key = uploaded?.key ?? key;
  }

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [newCatalog] = await tx
        .insert(catalog)
        .values({
          ...catalogData,
          logo: logo === null ? null : (key ?? null),
          createdBy: context?.session?.user.id,
          updatedBy: context?.session?.user.id,
        })
        .returning();

      if (!newCatalog) throw new Error("Failed to create catalog");

      if (points.length > 0) {
        await tx.insert(catalogPoint).values(
          points.map((p) => ({
            text: p.text,
            textAr: p.textAr,
            order: p.order,
            catalogId: newCatalog.id,
            subCatalogId: null,
          })),
        );
      }

      const insertedSubCatalogs: (typeof catalogSubCatalog.$inferSelect)[] = [];

      for (const sub of subCatalogs) {
        const [insertedSub] = await tx
          .insert(catalogSubCatalog)
          .values({
            heading: sub.heading,
            headingAr: sub.headingAr,
            order: sub.order,
            catalogId: newCatalog.id,
          })
          .returning();

        if (!insertedSub) throw new Error("Failed to create subcatalog");

        if (sub.points.length > 0) {
          await tx.insert(catalogPoint).values(
            sub.points.map((p) => ({
              text: p.text,
              textAr: p.textAr,
              order: p.order,
              catalogId: null,
              subCatalogId: insertedSub.id,
            })),
          );
        }

        insertedSubCatalogs.push(insertedSub);
      }

      return newCatalog;
    }),
  );

  if (error || !result) {
    if (key) {
      await deleteFile(key).catch(() => {});
    }
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create catalog",
    });
  }

  const full = await db.query.catalog.findFirst({
    where: eq(catalog.id, result.id),
    columns: {
      createdAt: false,
      updatedAt: false,
      serviceId: false,
    },
    with: withNested,
  });

  if (!full) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to get created catalog",
    });
  }

  return { catalog: full };
};

export const updateCatalog = async ({
  input,
  context,
}: {
  input: UpdateCatalogInput;
  context: Context;
}) => {
  const { id, logo, points, subCatalogs, ...catalogData } = input;

  const existing = await db.query.catalog.findFirst({
    where: eq(catalog.id, id),
    columns: { logo: true },
  });

  if (!existing)
    throw new ORPCError("NOT_FOUND", { message: "Catalog not found" });

  let newKey: string | undefined;

  if (logo) {
    newKey = generateKey(logo, "catalog");
    const { data: uploaded } = await tryCatch(
      uploadFile(newKey, logo, {
        contentType: logo.type || undefined,
        metadata: { originalName: logo.name },
      }),
    );
    newKey = uploaded?.key ?? newKey;
  }

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [updated] = await tx
        .update(catalog)
        .set({
          ...catalogData,
          ...((newKey !== undefined || logo === null) && {
            logo: logo === null ? null : (newKey ?? null),
          }),
          updatedBy: context?.session?.user.id,
        })
        .where(eq(catalog.id, id))
        .returning();

      if (!updated) throw new Error("Catalog not found");

      // Points and subCatalogs are mutually exclusive — sending one wipes the other
      if (points !== undefined) {
        await tx
          .delete(catalogSubCatalog)
          .where(eq(catalogSubCatalog.catalogId, id));
        await tx.delete(catalogPoint).where(eq(catalogPoint.catalogId, id));

        if (points.length > 0) {
          await tx.insert(catalogPoint).values(
            points.map((p) => ({
              text: p.text,
              textAr: p.textAr,
              order: p.order,
              catalogId: id,
              subCatalogId: null,
            })),
          );
        }
      }

      if (subCatalogs !== undefined) {
        await tx.delete(catalogPoint).where(eq(catalogPoint.catalogId, id));
        await tx
          .delete(catalogSubCatalog)
          .where(eq(catalogSubCatalog.catalogId, id));

        for (const sub of subCatalogs) {
          const [insertedSub] = await tx
            .insert(catalogSubCatalog)
            .values({
              heading: sub.heading,
              headingAr: sub.headingAr,
              order: sub.order,
              catalogId: id,
            })
            .returning();

          if (!insertedSub) throw new Error("Failed to create subcatalog");

          if (sub.points.length > 0) {
            await tx.insert(catalogPoint).values(
              sub.points.map((p) => ({
                text: p.text,
                textAr: p.textAr,
                order: p.order,
                catalogId: null,
                subCatalogId: insertedSub.id,
              })),
            );
          }
        }
      }

      return { id };
    }),
  );

  if (error || !result) {
    if (newKey) await deleteFile(newKey).catch(() => {});
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update catalog",
    });
  }

  if (newKey && existing.logo) {
    await deleteFile(existing.logo).catch(() => {});
  }

  const full = await db.query.catalog.findFirst({
    where: eq(catalog.id, id),
    columns: {
      createdAt: false,
      updatedAt: false,
      serviceId: false,
    },
    with: withNested,
  });

  if (!full) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to get updated catalog",
    });
  }

  return { catalog: full };
};

export const deleteCatalog = async ({ input }: { input: CatalogIdInput }) => {
  const [deleted] = await db
    .delete(catalog)
    .where(eq(catalog.id, input.id))
    .returning();

  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Catalog not found" });

  if (deleted.logo) {
    await deleteFile(deleted.logo).catch(() => {});
  }

  return { success: true, message: "Catalog deleted" };
};
