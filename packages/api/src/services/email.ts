import { db } from "@e-service/db";
import { and, count, eq, or } from "@e-service/db/drizzle/orm";
import { emailTemplate } from "@e-service/db/schema/email";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { ORPCError } from "@orpc/server";
import type { Context } from "../context";
import {
  EMAIL_TEMPLATE_SELECTABLE_COLUMNS,
  EMAIL_TEMPLATE_SORT_FIELDS,
} from "../schema/email";
import type {
  CreateEmailTemplateInput,
  EmailTemplateGetInput,
  EmailTemplateIdInput,
  ListEmailTemplatesInput,
  UpdateEmailTemplateInput,
} from "../types/email";
import {
  buildColumnsMask,
  buildWhereClause,
  buildWithDefaultColumns,
  returnDefaultColumns,
} from "../utils/filter";
import { isConstrainViolation } from "../utils/pg-error";
import { buildOrderBy } from "../utils/sort";

export const listEmailTemplates = async ({
  input,
}: {
  input: ListEmailTemplatesInput;
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
  const columns = buildColumnsMask(select, EMAIL_TEMPLATE_SELECTABLE_COLUMNS);

  const conditions = filter
    ? [
        buildWhereClause(emailTemplate.name, filter.name),
        buildWhereClause(emailTemplate.subject, filter.subject),
        buildWhereClause(emailTemplate.type, filter.type),
        buildWhereClause(emailTemplate.isActive, filter.isActive),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.emailTemplate.findMany({
      columns: columns
        ? columns
        : buildWithDefaultColumns(EMAIL_TEMPLATE_SELECTABLE_COLUMNS),
      where,
      orderBy: (t) =>
        buildOrderBy(t, sort, EMAIL_TEMPLATE_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
    });
    const total = rows.length;
    return {
      data: rows,
      total,
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
    db.query.emailTemplate.findMany({
      columns: columns
        ? columns
        : buildWithDefaultColumns(EMAIL_TEMPLATE_SELECTABLE_COLUMNS),
      where,
      orderBy: (t) =>
        buildOrderBy(t, sort, EMAIL_TEMPLATE_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(emailTemplate).where(where),
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

export const getEmailTemplate = async ({
  input,
}: {
  input: EmailTemplateGetInput;
}) => {
  const { id, select } = input;
  const columns = buildColumnsMask(select, EMAIL_TEMPLATE_SELECTABLE_COLUMNS);

  const found = await db.query.emailTemplate.findFirst({
    columns: columns
      ? columns
      : buildWithDefaultColumns(EMAIL_TEMPLATE_SELECTABLE_COLUMNS),
    where: eq(emailTemplate.id, id),
  });
  if (!found)
    throw new ORPCError("NOT_FOUND", {
      message: "Email template not found",
    });
  return { emailTemplate: found };
};

export const createEmailTemplate = async ({
  input,
  context,
}: {
  input: CreateEmailTemplateInput;
  context: Context;
}) => {
  const { data: created, error } = await tryCatch(
    db
      .insert(emailTemplate)
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
        ? "An email template with that name already exists"
        : (error?.message ?? "Failed to create email template"),
    });
  }

  return {
    emailTemplate: returnDefaultColumns(EMAIL_TEMPLATE_SELECTABLE_COLUMNS, row),
  };
};

export const updateEmailTemplate = async ({
  input,
  context,
}: {
  input: UpdateEmailTemplateInput;
  context: Context;
}) => {
  const { id, ...data } = input;

  const { data: updated, error } = await tryCatch(
    db
      .update(emailTemplate)
      .set({ ...data, updatedBy: context?.session?.user.id })
      .where(eq(emailTemplate.id, id))
      .returning(),
  );

  const row = updated?.[0];

  if (error || !row) {
    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    const uniqueHit = !!error && isUniqueConstraintViolation;

    throw new ORPCError(uniqueHit ? "CONFLICT" : "BAD_REQUEST", {
      message: uniqueHit
        ? "An email template with that name already exists"
        : (error?.message ?? "Failed to update email template"),
    });
  }

  return {
    emailTemplate: returnDefaultColumns(EMAIL_TEMPLATE_SELECTABLE_COLUMNS, row),
  };
};

export const deleteEmailTemplate = async ({
  input,
}: {
  input: EmailTemplateIdInput;
}) => {
  const [deleted] = await db
    .delete(emailTemplate)
    .where(eq(emailTemplate.id, input.id))
    .returning();
  if (!deleted)
    throw new ORPCError("NOT_FOUND", {
      message: "Email template not found",
    });
  return { success: true, message: "Email template deleted" };
};
