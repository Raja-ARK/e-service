import { db } from "@e-service/db";
import { and, count, eq, or } from "@e-service/db/drizzle/orm";
import { prerequisite } from "@e-service/db/schema/service/prerequisite";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { ORPCError } from "@orpc/server";
import { PREREQUISITE_SORT_FIELDS } from "../../schema/service/prerequisite";
import type {
  CreatePrerequisiteInput,
  ListPrerequisitesInput,
  PrerequisiteIdInput,
  UpdatePrerequisiteInput,
} from "../../types/service/prerequisite";
import { buildWhereClause, returnDefaultColumns } from "../../utils/filter";
import { buildOrderBy } from "../../utils/sort";

const columns = {
  id: true,
  text: true,
  textAr: true,
} as const;

const columnKeys = Object.keys(columns) as (keyof typeof columns)[];

export const listPrerequisites = async ({
  input,
}: {
  input: ListPrerequisitesInput;
}) => {
  const { page, limit, filter, filterCondition, sort, withoutPagination } =
    input;

  const conditions = filter
    ? [
        buildWhereClause(prerequisite.serviceId, filter.serviceId),
        buildWhereClause(prerequisite.text, filter.text),
        buildWhereClause(prerequisite.textAr, filter.textAr),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.prerequisite.findMany({
      columns,
      where,
      orderBy: (p) =>
        buildOrderBy(p, sort, PREREQUISITE_SORT_FIELDS, {
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
    db.query.prerequisite.findMany({
      columns,
      where,
      orderBy: (p) =>
        buildOrderBy(p, sort, PREREQUISITE_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(prerequisite).where(where),
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

export const getPrerequisite = async ({
  input,
}: {
  input: PrerequisiteIdInput;
}) => {
  const found = await db.query.prerequisite.findFirst({
    where: eq(prerequisite.id, input.id),
    columns,
  });
  if (!found)
    throw new ORPCError("NOT_FOUND", { message: "Prerequisite not found" });
  return { prerequisite: found };
};

export const createPrerequisite = async ({
  input,
}: {
  input: CreatePrerequisiteInput;
}) => {
  const { data: created, error } = await tryCatch(
    db.insert(prerequisite).values(input).returning(),
  );

  const newPrerequisite = created?.[0];

  if (error || !newPrerequisite) {
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create prerequisite",
    });
  }

  return { prerequisite: returnDefaultColumns(columnKeys, newPrerequisite) };
};

export const updatePrerequisite = async ({
  input,
}: {
  input: UpdatePrerequisiteInput;
}) => {
  const { id, ...data } = input;

  const { data: updated, error } = await tryCatch(
    db
      .update(prerequisite)
      .set(data)
      .where(eq(prerequisite.id, id))
      .returning(),
  );

  const updatedPrerequisite = updated?.[0];

  if (error || !updatedPrerequisite) {
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update prerequisite",
    });
  }

  return {
    prerequisite: returnDefaultColumns(columnKeys, updatedPrerequisite),
  };
};

export const deletePrerequisite = async ({
  input,
}: {
  input: PrerequisiteIdInput;
}) => {
  const [deleted] = await db
    .delete(prerequisite)
    .where(eq(prerequisite.id, input.id))
    .returning();

  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Prerequisite not found" });

  return { success: true, message: "Prerequisite deleted" };
};
