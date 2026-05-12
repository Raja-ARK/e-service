import { db } from "@e-service/db";
import { and, count, eq, inArray, or } from "@e-service/db/drizzle/orm";
import { lookupOptions } from "@e-service/db/schema/lookup";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { ORPCError } from "@orpc/server";
import {
  LOOKUP_SELECTABLE_COLUMNS,
  LOOKUP_SORT_FIELDS,
} from "../schema/lookup";
import type {
  BulkCreateLookupOptionsInput,
  BulkDeleteLookupOptionsInput,
  BulkUpdateLookupOptionsInput,
  CreateLookupOptionInput,
  GetLookupOptionInput,
  ListLookupOptionsInput,
  LookupIdInput,
  UpdateLookupOptionInput,
} from "../types/lookup";
import { buildColumnsMask, buildWhereClause } from "../utils/filter";
import { isConstrainViolation } from "../utils/pg-error";
import { buildOrderBy } from "../utils/sort";

export const listLookupOptions = async ({
  input,
}: {
  input: ListLookupOptionsInput;
}) => {
  const {
    page,
    limit,
    filter,
    filterCondition,
    sort,
    select,
    withoutPagination,
  } = input;
  const columns = buildColumnsMask(select, LOOKUP_SELECTABLE_COLUMNS);

  const conditions = filter
    ? [
        buildWhereClause(lookupOptions.type, filter.type),
        buildWhereClause(lookupOptions.code, filter.code),
        buildWhereClause(lookupOptions.label, filter.label),
        buildWhereClause(lookupOptions.labelAr, filter.labelAr),
        buildWhereClause(lookupOptions.parentType, filter.parentType),
        buildWhereClause(lookupOptions.parentCode, filter.parentCode),
        buildWhereClause(lookupOptions.isActive, filter.isActive),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.lookupOptions.findMany({
      ...(columns ? { columns } : {}),
      where,
      orderBy: (l) =>
        buildOrderBy(l, sort, LOOKUP_SORT_FIELDS, {
          field: "order",
          direction: "asc",
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
    db.query.lookupOptions.findMany({
      ...(columns ? { columns } : {}),
      where,
      orderBy: (l) =>
        buildOrderBy(l, sort, LOOKUP_SORT_FIELDS, {
          field: "order",
          direction: "asc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(lookupOptions).where(where),
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

export const getLookupOption = async ({
  input,
}: {
  input: GetLookupOptionInput;
}) => {
  const { id, select } = input;
  const columns = buildColumnsMask(select, LOOKUP_SELECTABLE_COLUMNS);

  const found = await db.query.lookupOptions.findFirst({
    ...(columns ? { columns } : {}),
    where: eq(lookupOptions.id, id),
  });
  if (!found)
    throw new ORPCError("NOT_FOUND", { message: "Lookup option not found" });
  return { lookupOption: found };
};

export const createLookupOption = async ({
  input,
}: {
  input: CreateLookupOptionInput;
}) => {
  const { data: created, error } = await tryCatch(
    db.insert(lookupOptions).values(input).returning(),
  );

  const newOption = created?.[0];

  if (error || !newOption) {
    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    throw new ORPCError(
      isUniqueConstraintViolation ? "CONFLICT" : "BAD_REQUEST",
      {
        message: isUniqueConstraintViolation
          ? "A lookup option with that type and code already exists"
          : (error?.message ?? "Failed to create lookup option"),
      },
    );
  }

  return { lookupOption: newOption };
};

export const updateLookupOption = async ({
  input,
}: {
  input: LookupIdInput & UpdateLookupOptionInput;
}) => {
  const { id, ...data } = input;

  const { data: updated, error } = await tryCatch(
    db
      .update(lookupOptions)
      .set(data)
      .where(eq(lookupOptions.id, id))
      .returning(),
  );

  const updatedOption = updated?.[0];

  if (error || !updatedOption) {
    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    throw new ORPCError(
      isUniqueConstraintViolation ? "CONFLICT" : "BAD_REQUEST",
      {
        message: isUniqueConstraintViolation
          ? "A lookup option with that type and code already exists"
          : (error?.message ?? "Failed to update lookup option"),
      },
    );
  }

  return { lookupOption: updatedOption };
};

export const deleteLookupOption = async ({
  input,
}: {
  input: LookupIdInput;
}) => {
  const [deleted] = await db
    .delete(lookupOptions)
    .where(eq(lookupOptions.id, input.id))
    .returning();
  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Lookup option not found" });
  return { success: true, message: "Lookup option deleted" };
};

export const bulkCreateLookupOptions = async ({
  input,
}: {
  input: BulkCreateLookupOptionsInput;
}) => {
  const { data: created, error } = await tryCatch(
    db.insert(lookupOptions).values(input.items).returning(),
  );

  if (error || !created) {
    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    throw new ORPCError(
      isUniqueConstraintViolation ? "CONFLICT" : "BAD_REQUEST",
      {
        message: isUniqueConstraintViolation
          ? "One or more lookup options with the same type and code already exist"
          : (error?.message ?? "Failed to bulk create lookup options"),
      },
    );
  }

  return {
    success: true,
    count: created.length,
    message: `Created ${created.length} lookup options`,
  };
};

export const bulkUpdateLookupOptions = async ({
  input,
}: {
  input: BulkUpdateLookupOptionsInput;
}) => {
  const results = await Promise.all(
    input.items.map(({ id, ...data }) =>
      db
        .update(lookupOptions)
        .set(data)
        .where(eq(lookupOptions.id, id))
        .returning(),
    ),
  );

  const updated = results.flat();
  return {
    success: true,
    count: updated.length,
    message: `Updated ${updated.length} lookup options`,
  };
};

export const bulkDeleteLookupOptions = async ({
  input,
}: {
  input: BulkDeleteLookupOptionsInput;
}) => {
  const deleted = await db
    .delete(lookupOptions)
    .where(inArray(lookupOptions.id, input.ids))
    .returning();

  if (deleted.length === 0)
    throw new ORPCError("NOT_FOUND", {
      message: "No lookup options found with given IDs",
    });

  return {
    success: true,
    count: deleted.length,
    message: `Deleted ${deleted.length} lookup options`,
  };
};
