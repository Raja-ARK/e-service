import { db } from "@e-service/db";
import { and, count, eq, or } from "@e-service/db/drizzle/orm";
import { department } from "@e-service/db/schema/department";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { deleteFile, uploadFile } from "@e-service/storage";
import { generateKey } from "@e-service/storage/utils";
import { ORPCError } from "@orpc/server";
import type { Context } from "../context";
import {
  DEPARTMENT_SELECTABLE_COLUMNS,
  DEPARTMENT_SORT_FIELDS,
} from "../schema/department";
import type {
  CreateDepartmentInput,
  DepartmentGetInput,
  DepartmentIdInput,
  ListDepartmentsInput,
  UpdateDepartmentInput,
} from "../types/department";
import { buildColumnsMask, buildWhereClause } from "../utils/filter";
import { isConstrainViolation } from "../utils/pg-error";
import { buildOrderBy } from "../utils/sort";

export const listDepartments = async ({
  input,
}: {
  input: ListDepartmentsInput;
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
  const columns = buildColumnsMask(select, DEPARTMENT_SELECTABLE_COLUMNS);

  const conditions = filter
    ? [
        buildWhereClause(department.name, filter.name),
        buildWhereClause(department.nameAr, filter.nameAr),
        buildWhereClause(department.isActive, filter.isActive),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.department.findMany({
      ...(columns ? { columns } : {}),
      where,
      orderBy: (d) =>
        buildOrderBy(d, sort, DEPARTMENT_SORT_FIELDS, {
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
    db.query.department.findMany({
      ...(columns ? { columns } : {}),
      where,
      orderBy: (d) =>
        buildOrderBy(d, sort, DEPARTMENT_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(department).where(where),
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

export const getDepartment = async ({
  input,
}: {
  input: DepartmentGetInput;
}) => {
  const { id, select } = input;
  const columns = buildColumnsMask(select, DEPARTMENT_SELECTABLE_COLUMNS);

  const found = await db.query.department.findFirst({
    ...(columns ? { columns } : {}),
    where: eq(department.id, id),
  });
  if (!found)
    throw new ORPCError("NOT_FOUND", { message: "Department not found" });
  return { department: found };
};

export const createDepartment = async ({
  input,
  context,
}: {
  input: CreateDepartmentInput;
  context: Context;
}) => {
  const { logo, ...data } = input;

  let key = logo ? generateKey(logo, "department") : undefined;

  if (logo && key) {
    const { data, error } = await tryCatch(
      uploadFile(key, logo, {
        contentType: logo.type || undefined,
        metadata: { originalName: logo.name },
      }),
    );
    key = data?.key ?? undefined;
    console.log(data, error);
  }

  const { data: created, error } = await tryCatch(
    db
      .insert(department)
      .values({
        ...data,
        logo: key ?? null,
        createdByUserId: context.session?.user.id,
        updatedByUserId: context.session?.user.id,
      })
      .returning(),
  );

  const newDepartment = created?.[0];

  if (error || !newDepartment) {
    if (key)
      await deleteFile(key).catch((err) => {
        console.log(err);
      });

    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    const uniqueHit = !!error && isUniqueConstraintViolation;

    throw new ORPCError(uniqueHit ? "CONFLICT" : "BAD_REQUEST", {
      message: uniqueHit
        ? "A department with that name, Arabic name already exists"
        : (error?.message ?? "Failed to create department"),
    });
  }

  return { department: newDepartment };
};

export const updateDepartment = async ({
  input,
  context,
}: {
  input: DepartmentIdInput & UpdateDepartmentInput;
  context: Context;
}) => {
  const { id, logo, ...data } = input;

  let newKey: string | undefined | null;
  let existingKey: string | undefined | null;

  if (logo) {
    // Fetch current logo key before update so we can delete it after success
    const existing = await db.query.department.findFirst({
      columns: { logo: true },
      where: eq(department.id, id),
    });

    existingKey = existing?.logo;

    newKey =
      logo === null ? null : logo ? generateKey(logo, "department") : undefined;

    if (logo && newKey) {
      const { data, error } = await tryCatch(
        uploadFile(newKey, logo, {
          contentType: logo.type || undefined,
          metadata: { originalName: logo.name },
        }),
      );
      newKey = data?.key ?? undefined;
      console.log(data, error);
    }
  }

  const { data: updated, error } = await tryCatch(
    db
      .update(department)
      .set({
        ...data,
        ...(newKey !== undefined && { logo: newKey }),
        updatedByUserId: context.session?.user.id,
      })
      .where(eq(department.id, id))
      .returning(),
  );

  const updatedDepartment = updated?.[0];

  if (error || !updatedDepartment) {
    // Rollback: delete newly uploaded file since DB update failed
    if (newKey) await deleteFile(newKey).catch(() => {});

    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    const uniqueHit = !!error && isUniqueConstraintViolation;

    throw new ORPCError(uniqueHit ? "CONFLICT" : "BAD_REQUEST", {
      message: uniqueHit
        ? "A department with that name, Arabic name already exists"
        : (error?.message ?? "Failed to update department"),
    });
  }

  // Best-effort: delete old logo after successful DB update
  if ((newKey || newKey === null) && existingKey) {
    await deleteFile(existingKey).catch(() => {});
  }

  return { department: updatedDepartment };
};

export const deleteDepartment = async ({
  input,
}: {
  input: DepartmentIdInput;
}) => {
  const [deleted] = await db
    .delete(department)
    .where(eq(department.id, input.id))
    .returning();

  if (deleted?.logo) {
    await deleteFile(deleted.logo).catch(() => {});
  }

  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Department not found" });
  return { success: true, message: "Department deleted" };
};
