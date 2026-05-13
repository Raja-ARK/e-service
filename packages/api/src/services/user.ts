import { auth } from "@e-service/auth";
import { db } from "@e-service/db";
import { and, count, eq, or } from "@e-service/db/drizzle/orm";
import { user } from "@e-service/db/schema/auth";
import type { User } from "@e-service/db/zod-schemas/auth";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { deleteFile, uploadFile } from "@e-service/storage";
import { generateKey } from "@e-service/storage/utils";
import { ORPCError } from "@orpc/server";
import type { Context } from "../context";
import { USER_SELECTABLE_COLUMNS, USER_SORT_FIELDS } from "../schema/user";
import type {
  CreateUserInput,
  GetUsersInput,
  ListUsersInput,
  RemoveUserInput,
  UpdateUserInput,
} from "../types/user";
import { buildColumnsMask, buildWhereClause } from "../utils/filter";
import { isConstrainViolation } from "../utils/pg-error";
import { buildOrderBy } from "../utils/sort";

const omitUndefined = <T extends Record<string, unknown>>(
  obj: T,
): Partial<T> => {
  const out: Partial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const v = obj[key];
    if (v !== undefined) out[key] = v as T[keyof T];
  }
  return out;
};

export const listUsers = async ({ input }: { input: ListUsersInput }) => {
  const {
    page,
    limit,
    filter,
    filterCondition,
    sort,
    select,
    withoutPagination,
  } = input;
  const columns = buildColumnsMask(select, USER_SELECTABLE_COLUMNS);

  const conditions = filter
    ? [
        buildWhereClause(user.name, filter.name),
        buildWhereClause(user.nameAr, filter.nameAr),
        buildWhereClause(user.email, filter.email),
        buildWhereClause(user.role, filter.role),
        buildWhereClause(user.banned, filter.banned),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.user.findMany({
      ...(columns ? { columns } : {}),
      where,
      orderBy: (u) =>
        buildOrderBy(u, sort, USER_SORT_FIELDS, {
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
    db.query.user.findMany({
      ...(columns ? { columns } : {}),
      where,
      orderBy: (u) =>
        buildOrderBy(u, sort, USER_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(user).where(where),
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

export const getUsers = async ({
  input,
  context,
}: {
  input: GetUsersInput;
  context: Context;
}) => {
  const uid = context?.session?.user.id;

  if (!uid) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  const userSession = context.session?.user;

  const columns = buildColumnsMask(input.select, USER_SELECTABLE_COLUMNS);

  const userData = await db.query.user.findFirst({
    ...(columns ? { columns } : {}),
    where:
      userSession?.role === "admin" && input.id
        ? eq(user.id, input.id)
        : eq(user.id, uid),
  });

  console.log("userData", userData);

  if (!userData) {
    throw new ORPCError("NOT_FOUND", { message: "User not found" });
  }

  return { user: userData };
};

export const createUser = async ({
  input,
  context,
}: {
  input: CreateUserInput;
  context: Context;
}) => {
  const { password, role, email, name, ...profile } = input;

  const { data: created, error } = await tryCatch(
    auth.api.createUser({
      body: {
        email,
        password,
        name,
        role,
        data: omitUndefined(profile) as Record<string, unknown>,
      },
      headers: context.headers,
    }),
  );

  const newUser = created?.user as unknown as User;

  if (error || !newUser) {
    const { isUniqueConstraintViolation } = isConstrainViolation(error);
    const uniqueHit = !!error && isUniqueConstraintViolation;

    throw new ORPCError(uniqueHit ? "CONFLICT" : "BAD_REQUEST", {
      message: uniqueHit
        ? "A user with that email already exists"
        : (error?.message ?? "Failed to create user"),
    });
  }

  return { user: newUser };
};

export const removeUser = async ({
  input,
  context,
}: {
  input: RemoveUserInput;
  context: Context;
}) => {
  if (input.id === context?.session?.user.id) {
    throw new ORPCError("BAD_REQUEST", {
      message: "You cannot remove your own account from this action",
    });
  }

  const { error } = await tryCatch(
    auth.api.removeUser({
      body: { userId: input.id },
      headers: context.headers,
    }),
  );

  if (error) {
    throw new ORPCError("BAD_REQUEST", {
      message: error instanceof Error ? error.message : "Failed to remove user",
    });
  }

  return { success: true, message: "User removed" };
};

export const updateUser = async ({
  input,
  context,
}: {
  input: UpdateUserInput;
  context: Context;
}) => {
  const sessionUser = context?.session?.user;

  if (!sessionUser) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  const targetId = input.id ?? sessionUser.id;
  const isSelf = targetId === sessionUser.id;
  const isAdmin = sessionUser.role === "admin";

  if (!isSelf && !isAdmin) {
    throw new ORPCError("FORBIDDEN", {
      message: "You can only update your own profile",
    });
  }

  if (
    !isSelf &&
    isAdmin &&
    (input.id === undefined || input.id === null || input.id?.trim() === "")
  ) {
    throw new ORPCError("BAD_REQUEST", {
      message: "User id is required to update another user",
    });
  }

  const { id: _id, image, ...rest } = input;
  const patch = omitUndefined(rest) as Record<string, unknown>;

  let newImageKey: string | undefined;
  let oldImageKey: string | undefined;

  if (image) {
    if (!isSelf) {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.id, targetId),
        columns: { image: true },
      });

      oldImageKey = existingUser?.image ?? undefined;
    }

    oldImageKey = sessionUser.image ?? undefined;
    newImageKey = generateKey(image, "user");

    const { data, error } = await tryCatch(
      uploadFile(newImageKey, image, {
        contentType: image.type || undefined,
        metadata: { originalName: image.name },
      }),
    );

    console.log(data, error);

    patch.image = data?.key ?? null;
  }

  if (isSelf) {
    delete patch.role;
    delete patch.banned;
    delete patch.banReason;
    delete patch.banExpires;
    delete patch.email;
    delete patch.emailVerified;
  }

  if (Object.keys(patch).length === 0) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Nothing to update",
    });
  }

  const existing = await db.query.user.findFirst({
    where: eq(user.id, targetId),
    columns: { id: true },
  });

  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "User not found" });
  }

  if (isAdmin && !isSelf) {
    const { data, error } = await tryCatch(
      auth.api.adminUpdateUser({
        body: {
          userId: input.id,
          data: {
            ...patch,
            image: newImageKey ?? null,
          },
        },
        headers: context.headers,
      }),
    );

    if (error || !data) {
      if (newImageKey) await deleteFile(newImageKey).catch(() => {});
      throw new ORPCError("BAD_REQUEST", {
        message:
          error instanceof Error ? error.message : "Failed to update user",
      });
    }

    if (newImageKey && oldImageKey)
      await deleteFile(oldImageKey).catch((err) => {
        console.log(err);
      });
    return { success: true, message: "User updated" };
  }

  const { data: updated, error } = await tryCatch(
    auth.api.updateUser({
      body: { ...patch, image: newImageKey ?? null },
      headers: context.headers,
    }),
  );

  const row = updated?.status;

  if (error || !row) {
    if (newImageKey)
      await deleteFile(newImageKey).catch((err) => {
        console.log(err);
      });
    throw new ORPCError("BAD_REQUEST", {
      message: error instanceof Error ? error.message : "Failed to update user",
    });
  }

  if ((newImageKey || newImageKey === null) && oldImageKey)
    await deleteFile(oldImageKey).catch((err) => {
      console.log(err);
    });

  return { success: true, message: "User updated" };
};
