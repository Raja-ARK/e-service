import { db } from "@e-service/db";
import { and, count, eq, or } from "@e-service/db/drizzle/orm";
import { documentTemplate } from "@e-service/db/schema/document";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { ORPCError } from "@orpc/server";
import {
  DOCUMENT_TEMPLATE_SELECTABLE_COLUMNS,
  DOCUMENT_TEMPLATE_SORT_FIELDS,
} from "../schema/document";
import type {
  CreateDocumentTemplateInput,
  DocumentTemplateGetInput,
  DocumentTemplateIdInput,
  ListDocumentTemplatesInput,
  UpdateDocumentTemplateInput,
} from "../types/document";
import { buildColumnsMask, buildWhereClause } from "../utils/filter";
import { isConstrainViolation } from "../utils/pg-error";
import { buildOrderBy } from "../utils/sort";

export const listDocumentTemplates = async ({
  input,
}: {
  input: ListDocumentTemplatesInput;
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
  const columns = buildColumnsMask(
    select,
    DOCUMENT_TEMPLATE_SELECTABLE_COLUMNS,
  );

  const conditions = filter
    ? [
        buildWhereClause(documentTemplate.name, filter.name),
        buildWhereClause(documentTemplate.nameAr, filter.nameAr),
        buildWhereClause(documentTemplate.isActive, filter.isActive),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.documentTemplate.findMany({
      ...(columns ? { columns } : {}),
      where,
      orderBy: (t) =>
        buildOrderBy(t, sort, DOCUMENT_TEMPLATE_SORT_FIELDS, {
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
    db.query.documentTemplate.findMany({
      ...(columns ? { columns } : {}),
      where,
      orderBy: (t) =>
        buildOrderBy(t, sort, DOCUMENT_TEMPLATE_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(documentTemplate).where(where),
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

export const getDocumentTemplate = async ({
  input,
}: {
  input: DocumentTemplateGetInput;
}) => {
  const { id, select } = input;
  const columns = buildColumnsMask(
    select,
    DOCUMENT_TEMPLATE_SELECTABLE_COLUMNS,
  );

  const found = await db.query.documentTemplate.findFirst({
    ...(columns ? { columns } : {}),
    where: eq(documentTemplate.id, id),
  });
  if (!found)
    throw new ORPCError("NOT_FOUND", {
      message: "Document template not found",
    });
  return { documentTemplate: found };
};

export const createDocumentTemplate = async ({
  input,
}: {
  input: CreateDocumentTemplateInput;
}) => {
  const { data: created, error } = await tryCatch(
    db.insert(documentTemplate).values(input).returning(),
  );

  const row = created?.[0];

  if (error || !row) {
    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    const uniqueHit = !!error && isUniqueConstraintViolation;

    throw new ORPCError(uniqueHit ? "CONFLICT" : "BAD_REQUEST", {
      message: uniqueHit
        ? "A document template with that name already exists"
        : (error?.message ?? "Failed to create document template"),
    });
  }

  return { documentTemplate: row };
};

export const updateDocumentTemplate = async ({
  input,
}: {
  input: UpdateDocumentTemplateInput;
}) => {
  const { id, ...data } = input;

  const { data: updated, error } = await tryCatch(
    db
      .update(documentTemplate)
      .set(data)
      .where(eq(documentTemplate.id, id))
      .returning(),
  );

  const row = updated?.[0];

  if (error || !row) {
    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    const uniqueHit = !!error && isUniqueConstraintViolation;

    throw new ORPCError(uniqueHit ? "CONFLICT" : "BAD_REQUEST", {
      message: uniqueHit
        ? "A document template with that name already exists"
        : (error?.message ?? "Failed to update document template"),
    });
  }

  return { documentTemplate: row };
};

export const deleteDocumentTemplate = async ({
  input,
}: {
  input: DocumentTemplateIdInput;
}) => {
  const [deleted] = await db
    .delete(documentTemplate)
    .where(eq(documentTemplate.id, input.id))
    .returning();
  if (!deleted)
    throw new ORPCError("NOT_FOUND", {
      message: "Document template not found",
    });
  return { success: true, message: "Document template deleted" };
};
