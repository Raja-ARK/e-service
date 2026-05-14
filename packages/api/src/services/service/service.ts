import { db } from "@e-service/db";
import { and, count, eq, or } from "@e-service/db/drizzle/orm";
import { request } from "@e-service/db/schema/request";
import { service } from "@e-service/db/schema/service/service";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { deleteFile, uploadFile } from "@e-service/storage";
import { generateKey } from "@e-service/storage/utils";
import { ORPCError } from "@orpc/server";
import type { Context } from "../../context";
import {
  SERVICE_SELECTABLE_COLUMNS,
  SERVICE_SORT_FIELDS,
} from "../../schema/service/service";
import type {
  CreateServiceInput,
  DeleteServiceInput,
  GetServiceInput,
  ListServicesInput,
  UpdateServiceInput,
} from "../../types/service/service";
import {
  buildColumnsMask,
  buildWhereClause,
  buildWithDefaultColumns,
  returnDefaultColumns,
} from "../../utils/filter";
import { isConstrainViolation } from "../../utils/pg-error";
import { buildOrderBy } from "../../utils/sort";

export const listServices = async ({ input }: { input: ListServicesInput }) => {
  const {
    page,
    limit,
    filter,
    filterCondition,
    sort,
    select,
    withoutPagination,
  } = input;
  const columns = buildColumnsMask(select, SERVICE_SELECTABLE_COLUMNS);

  const conditions = filter
    ? [
        buildWhereClause(service.name, filter.name),
        buildWhereClause(service.nameAr, filter.nameAr),
        buildWhereClause(service.isActive, filter.isActive),
        buildWhereClause(service.serviceCode, filter.serviceCode),
        buildWhereClause(service.departmentId, filter.departmentId),
        buildWhereClause(service.category, filter.category),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.service.findMany({
      columns: columns
        ? columns
        : buildWithDefaultColumns(SERVICE_SELECTABLE_COLUMNS),
      where,
      orderBy: (s) =>
        buildOrderBy(s, sort, SERVICE_SORT_FIELDS, {
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
    db.query.service.findMany({
      columns: columns
        ? columns
        : buildWithDefaultColumns(SERVICE_SELECTABLE_COLUMNS),
      where,
      orderBy: (s) =>
        buildOrderBy(s, sort, SERVICE_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(service).where(where),
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

export const getService = async ({ input }: { input: GetServiceInput }) => {
  const { id, select } = input;
  const columns = buildColumnsMask(select, SERVICE_SELECTABLE_COLUMNS);

  const found = await db.query.service.findFirst({
    columns: columns
      ? columns
      : buildWithDefaultColumns(SERVICE_SELECTABLE_COLUMNS),
    where: eq(service.id, id),
  });
  if (!found)
    throw new ORPCError("NOT_FOUND", { message: "Service not found" });
  return { service: found };
};

export const createService = async ({
  input,
  context,
}: {
  input: CreateServiceInput;
  context: Context;
}) => {
  const { logo, ...data } = input;

  let key = logo ? generateKey(logo, "service/logo") : undefined;

  if (logo && key) {
    const { data: uploaded, error } = await tryCatch(
      uploadFile(key, logo, {
        contentType: logo.type || undefined,
        metadata: { originalName: logo.name },
      }),
    );
    key = uploaded?.key ?? undefined;
    console.log(uploaded, error);
  }

  const { data: created, error } = await tryCatch(
    db
      .insert(service)
      .values({
        ...data,
        logo: key ?? null,
        createdBy: context?.session?.user.id,
        updatedBy: context?.session?.user.id,
      })
      .returning(),
  );

  const newService = created?.[0];

  if (error || !newService) {
    if (key) await deleteFile(key).catch((err) => console.log(err));

    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    const uniqueHit = !!error && isUniqueConstraintViolation;

    throw new ORPCError(uniqueHit ? "CONFLICT" : "BAD_REQUEST", {
      message: uniqueHit
        ? "A service with that code already exists"
        : (error?.message ?? "Failed to create service"),
    });
  }

  return {
    service: returnDefaultColumns(SERVICE_SELECTABLE_COLUMNS, newService),
  };
};

export const updateService = async ({
  input,
  context,
}: {
  input: UpdateServiceInput;
  context: Context;
}) => {
  const { id, logo, ...data } = input;

  let newKey: string | undefined | null;
  let existingKey: string | undefined | null;

  if (logo) {
    const existing = await db.query.service.findFirst({
      columns: { logo: true },
      where: eq(service.id, id),
    });

    existingKey = existing?.logo;

    newKey =
      logo === null
        ? null
        : logo
          ? generateKey(logo, "service/logo")
          : undefined;

    if (logo && newKey) {
      const { data: uploaded, error } = await tryCatch(
        uploadFile(newKey, logo, {
          contentType: logo.type || undefined,
          metadata: { originalName: logo.name },
        }),
      );
      newKey = uploaded?.key ?? undefined;
      console.log(uploaded, error);
    }
  }

  const { data: updated, error } = await tryCatch(
    db
      .update(service)
      .set({
        ...data,
        ...((newKey !== undefined || logo === null) && {
          logo: logo === null ? null : (newKey ?? null),
        }),
        updatedBy: context?.session?.user.id,
      })
      .where(eq(service.id, id))
      .returning(),
  );

  const updatedService = updated?.[0];

  if (error || !updatedService) {
    if (newKey) await deleteFile(newKey).catch((err) => console.log(err));

    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    const uniqueHit = !!error && isUniqueConstraintViolation;

    throw new ORPCError(uniqueHit ? "CONFLICT" : "BAD_REQUEST", {
      message: uniqueHit
        ? "A service with that code already exists"
        : (error?.message ?? "Failed to update service"),
    });
  }

  if ((newKey || logo === null) && existingKey) {
    await deleteFile(existingKey).catch((err) => console.log(err));
  }

  return {
    service: returnDefaultColumns(SERVICE_SELECTABLE_COLUMNS, updatedService),
  };
};

export const deleteService = async ({
  input,
}: {
  input: DeleteServiceInput;
}) => {
  const [result] = await db
    .select({ count: count() })
    .from(request)
    .where(eq(request.serviceId, input.id));

  if (result?.count && result.count > 0)
    throw new ORPCError("CONFLICT", {
      message: "Service has existing requests and cannot be deleted",
    });

  const [deleted] = await db
    .delete(service)
    .where(eq(service.id, input.id))
    .returning();

  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Service not found" });

  if (deleted?.logo) {
    await deleteFile(deleted.logo).catch((err) => console.log(err));
  }

  return { success: true, message: "Service deleted" };
};
