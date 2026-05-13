import { db } from "@e-service/db";
import { and, count, eq, or, type SQL, sql } from "@e-service/db/drizzle/orm";
import { announcement } from "@e-service/db/schema/announcement";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { ORPCError } from "@orpc/server";
import type { Context } from "../context";
import {
  ANNOUNCEMENT_SELECTABLE_COLUMNS,
  ANNOUNCEMENT_SORT_FIELDS,
} from "../schema/announcement";
import type {
  AnnouncementGetInput,
  AnnouncementIdInput,
  CreateAnnouncementInput,
  ListAnnouncementsInput,
  UpdateAnnouncementInput,
} from "../types/announcement";
import {
  buildColumnsMask,
  buildWhereClause,
  type FilterCondition,
} from "../utils/filter";
import { isConstrainViolation } from "../utils/pg-error";
import { buildOrderBy } from "../utils/sort";

const CATEGORY_VALUES = ["professional", "corporate"] as const;
type AnnouncementCategory = (typeof CATEGORY_VALUES)[number];

function isCategoryValue(v: string): v is AnnouncementCategory {
  return (CATEGORY_VALUES as readonly string[]).includes(v);
}

function buildCategoryWhereClause(
  filterValue: string | FilterCondition | undefined,
): SQL | undefined {
  if (filterValue === undefined) return undefined;
  const col = announcement.category;

  if (typeof filterValue === "string") {
    if (!isCategoryValue(filterValue)) return undefined;
    return sql`${col} @> ARRAY[${filterValue}]::category[]`;
  }

  const { operator, value } = filterValue;

  switch (operator) {
    case "equals": {
      if (typeof value === "string" && isCategoryValue(value)) {
        return sql`${col} @> ARRAY[${value}]::category[]`;
      }
      if (Array.isArray(value) && value.length > 0) {
        const vals = value.filter(
          (v): v is AnnouncementCategory =>
            typeof v === "string" && isCategoryValue(v),
        );
        if (vals.length === 0) return undefined;
        return eq(col, vals);
      }
      return undefined;
    }
    case "in": {
      if (!Array.isArray(value) || value.length === 0) return undefined;
      const vals = value.filter(
        (v): v is AnnouncementCategory =>
          typeof v === "string" && isCategoryValue(v),
      );
      if (vals.length === 0) return undefined;
      return sql`${col} && ARRAY[${sql.join(
        vals.map((v) => sql.raw(`'${v}'`)),
        sql.raw(", "),
      )}]::category[]`;
    }
    default:
      return undefined;
  }
}

export const listAnnouncements = async ({
  input,
}: {
  input: ListAnnouncementsInput;
}) => {
  const { page, limit, filter, filterCondition, sort, select } = input;
  const offset = (page - 1) * limit;
  const columns = buildColumnsMask(select, ANNOUNCEMENT_SELECTABLE_COLUMNS);

  const conditions = filter
    ? [
        buildWhereClause(announcement.title, filter.title),
        buildWhereClause(announcement.titleAr, filter.titleAr),
        buildWhereClause(announcement.description, filter.description),
        buildWhereClause(announcement.descriptionAr, filter.descriptionAr),
        buildWhereClause(announcement.issueDate, filter.issueDate),
        buildWhereClause(announcement.effectiveFrom, filter.effectiveFrom),
        buildWhereClause(announcement.effectiveTo, filter.effectiveTo),
        buildCategoryWhereClause(filter.category),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  const [rows, [total]] = await Promise.all([
    db.query.announcement.findMany({
      ...(columns ? { columns } : {}),
      where,
      orderBy: (a) =>
        buildOrderBy(a, sort, ANNOUNCEMENT_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(announcement).where(where),
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

export const getAnnouncement = async ({
  input,
}: {
  input: AnnouncementGetInput;
}) => {
  const { id, select } = input;
  const columns = buildColumnsMask(select, ANNOUNCEMENT_SELECTABLE_COLUMNS);

  const found = await db.query.announcement.findFirst({
    ...(columns ? { columns } : {}),
    where: eq(announcement.id, id),
  });
  if (!found)
    throw new ORPCError("NOT_FOUND", { message: "Announcement not found" });
  return { announcement: found };
};

export const createAnnouncement = async ({
  input,
  context,
}: {
  input: CreateAnnouncementInput;
  context: Context;
}) => {
  const { data: created, error } = await tryCatch(
    db
      .insert(announcement)
      .values({
        ...input,
        createdBy: context?.session?.user.id,
        updatedBy: context?.session?.user.id,
      })
      .returning(),
  );

  const row = created?.[0];

  if (error || !row) {
    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    const uniqueHit = !!error && isUniqueConstraintViolation;

    throw new ORPCError(uniqueHit ? "CONFLICT" : "BAD_REQUEST", {
      message: uniqueHit
        ? "Announcement violates a unique constraint"
        : (error?.message ?? "Failed to create announcement"),
    });
  }

  return { announcement: row };
};

export const updateAnnouncement = async ({
  input,
  context,
}: {
  input: AnnouncementIdInput & UpdateAnnouncementInput;
  context: Context;
}) => {
  const { id, ...data } = input;

  const { data: updated, error } = await tryCatch(
    db
      .update(announcement)
      .set({ ...data, updatedBy: context?.session?.user.id })
      .where(eq(announcement.id, id))
      .returning(),
  );

  const row = updated?.[0];

  if (error || !row) {
    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    const uniqueHit = !!error && isUniqueConstraintViolation;

    throw new ORPCError(uniqueHit ? "CONFLICT" : "BAD_REQUEST", {
      message: uniqueHit
        ? "Announcement violates a unique constraint"
        : (error?.message ?? "Failed to update announcement"),
    });
  }

  return { announcement: row };
};

export const deleteAnnouncement = async ({
  input,
}: {
  input: AnnouncementIdInput;
}) => {
  const [deleted] = await db
    .delete(announcement)
    .where(eq(announcement.id, input.id))
    .returning();
  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Announcement not found" });
  return { success: true, message: "Announcement deleted" };
};
