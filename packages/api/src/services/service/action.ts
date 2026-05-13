import { db } from "@e-service/db";
import { and, count, eq, or } from "@e-service/db/drizzle/orm";
import { action } from "@e-service/db/schema/service/stage";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { ORPCError } from "@orpc/server";
import type { Context } from "../../context";
import { ACTION_SORT_FIELDS } from "../../schema/service/action";
import type {
  ActionIdInput,
  CreateActionInput,
  ListActionsInput,
  UpdateActionInput,
} from "../../types/service/action";
import { buildWhereClause } from "../../utils/filter";
import { buildOrderBy } from "../../utils/sort";

export const listActions = async ({ input }: { input: ListActionsInput }) => {
  const { page, limit, filter, filterCondition, sort, withoutPagination } =
    input;

  const conditions = filter
    ? [
        buildWhereClause(action.stageId, filter.stageId),
        buildWhereClause(action.actionName, filter.actionName),
        buildWhereClause(action.actionNameAr, filter.actionNameAr),
        buildWhereClause(action.category, filter.category),
        buildWhereClause(action.disabled, filter.disabled),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.action.findMany({
      where,
      orderBy: (a) =>
        buildOrderBy(a, sort, ACTION_SORT_FIELDS, {
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
    db.query.action.findMany({
      where,
      orderBy: (a) =>
        buildOrderBy(a, sort, ACTION_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(action).where(where),
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

export const getAction = async ({ input }: { input: ActionIdInput }) => {
  const found = await db.query.action.findFirst({
    where: eq(action.id, input.id),
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Action not found" });
  return { action: found };
};

export const createAction = async ({
  input,
  context,
}: {
  input: CreateActionInput;
  context: Context;
}) => {
  const { data: created, error } = await tryCatch(
    db
      .insert(action)
      .values({
        ...input,
        createdBy: context?.session?.user.id,
        updatedBy: context?.session?.user.id,
      })
      .returning(),
  );

  const newAction = created?.[0];

  if (error || !newAction) {
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create action",
    });
  }

  return { action: newAction };
};

export const updateAction = async ({
  input,
  context,
}: {
  input: UpdateActionInput;
  context: Context;
}) => {
  const { id, ...data } = input;

  const { data: updated, error } = await tryCatch(
    db
      .update(action)
      .set({
        ...data,
        updatedBy: context?.session?.user.id,
      })
      .where(eq(action.id, id))
      .returning(),
  );

  const updatedAction = updated?.[0];

  if (error || !updatedAction) {
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update action",
    });
  }

  return { action: updatedAction };
};

export const deleteAction = async ({ input }: { input: ActionIdInput }) => {
  const [deleted] = await db
    .delete(action)
    .where(eq(action.id, input.id))
    .returning();

  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Action not found" });

  return { success: true, message: "Action deleted" };
};
