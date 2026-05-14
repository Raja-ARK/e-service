import { db } from "@e-service/db";
import { and, count, eq, or } from "@e-service/db/drizzle/orm";
import { stage } from "@e-service/db/schema/service/stage";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { ORPCError } from "@orpc/server";
import type { Context } from "../../context";
import { STAGE_SORT_FIELDS } from "../../schema/service/stage";
import type {
  CreateStageInput,
  ListStagesInput,
  StageIdInput,
  UpdateStageInput,
} from "../../types/service/stage";
import { buildWhereClause, returnDefaultColumns } from "../../utils/filter";
import { buildOrderBy } from "../../utils/sort";

const columns = {
  id: true,
  title: true,
  titleAr: true,
  order: true,
  isActive: true,
} as const;

const columnKeys = Object.keys(columns) as (keyof typeof columns)[];

export const listStages = async ({ input }: { input: ListStagesInput }) => {
  const { page, limit, filter, filterCondition, sort, withoutPagination } =
    input;

  const conditions = filter
    ? [
        buildWhereClause(stage.serviceId, filter.serviceId),
        buildWhereClause(stage.title, filter.title),
        buildWhereClause(stage.titleAr, filter.titleAr),
        buildWhereClause(stage.isActive, filter.isActive),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.stage.findMany({
      columns,
      where,
      orderBy: (s) =>
        buildOrderBy(s, sort, STAGE_SORT_FIELDS, {
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
    db.query.stage.findMany({
      columns,
      where,
      orderBy: (s) =>
        buildOrderBy(s, sort, STAGE_SORT_FIELDS, {
          field: "order",
          direction: "asc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(stage).where(where),
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

export const getStage = async ({ input }: { input: StageIdInput }) => {
  const found = await db.query.stage.findFirst({
    columns,
    where: eq(stage.id, input.id),
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Stage not found" });
  return { stage: found };
};

export const createStage = async ({
  input,
  context,
}: {
  input: CreateStageInput;
  context: Context;
}) => {
  const { data: created, error } = await tryCatch(
    db
      .insert(stage)
      .values({
        ...input,
        createdBy: context?.session?.user.id,
        updatedBy: context?.session?.user.id,
      })
      .returning(),
  );

  const newStage = created?.[0];

  if (error || !newStage) {
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create stage",
    });
  }

  return { stage: returnDefaultColumns(columnKeys, newStage) };
};

export const updateStage = async ({
  input,
  context,
}: {
  input: UpdateStageInput;
  context: Context;
}) => {
  const { id, ...data } = input;

  const { data: updated, error } = await tryCatch(
    db
      .update(stage)
      .set({ ...data, updatedBy: context?.session?.user.id })
      .where(eq(stage.id, id))
      .returning(),
  );

  const updatedStage = updated?.[0];

  if (error || !updatedStage) {
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update stage",
    });
  }

  return { stage: returnDefaultColumns(columnKeys, updatedStage) };
};

export const deleteStage = async ({ input }: { input: StageIdInput }) => {
  const [deleted] = await db
    .delete(stage)
    .where(eq(stage.id, input.id))
    .returning();

  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Stage not found" });

  return { success: true, message: "Stage deleted" };
};
