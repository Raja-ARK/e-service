import { db } from "@e-service/db";
import { eq, lt } from "@e-service/db/drizzle/orm";
import { uploadedFile } from "@e-service/db/schema/file";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import {
  deleteFile,
  downloadFile,
  FilesError,
  listFiles,
  uploadFile,
} from "@e-service/storage";
import { generateKey } from "@e-service/storage/utils";
import { ORPCError } from "@orpc/server";
import type { Context } from "../context";
import type {
  DeleteUploadInput,
  GetFileInput,
  ListFilesInput,
  UploadFileInput,
} from "../types/file";

export const getFile = async ({ input }: { input: GetFileInput }) => {
  const { data, error } = await tryCatch(downloadFile(input.key));

  if (error) {
    if (error instanceof FilesError && error.code === "NotFound")
      throw new ORPCError("NOT_FOUND", { message: "File not found" });
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to get file",
    });
  }

  const originalName =
    data.metadata?.originalName ?? input.key.split("/").pop() ?? input.key;
  const blob = await data.blob();
  return new File([blob], originalName, { type: data.type });
};

export const upload = async ({
  input,
  context,
}: {
  input: UploadFileInput;
  context: Context;
}) => {
  const user = context?.session?.user;
  if (!user) throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });

  const { file } = input;
  const key = generateKey(file, "service/request");

  const { data: stored, error } = await tryCatch(
    uploadFile(key, file, {
      contentType: file.type || undefined,
      metadata: { originalName: file.name, uploadedBy: user.id },
    }),
  );

  if (error || !stored) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to upload file",
    });
  }

  const { error: dbErr } = await tryCatch(
    db.insert(uploadedFile).values({ key: stored.key, uploadedBy: user.id }),
  );

  if (dbErr) {
    await deleteFile(stored.key).catch(() => {});
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to record uploaded file",
    });
  }

  return {
    key: stored.key,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  };
};

export const deleteUpload = async ({
  input,
  context,
}: {
  input: DeleteUploadInput;
  context: Context;
}) => {
  const user = context?.session?.user;
  if (!user) throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });

  const existing = await db.query.uploadedFile.findFirst({
    where: eq(uploadedFile.key, input.key),
    columns: { key: true, uploadedBy: true },
  });

  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "Upload not found" });
  }

  if (existing.uploadedBy !== user.id) {
    throw new ORPCError("FORBIDDEN", {
      message: "Not allowed to delete this file",
    });
  }

  await db.delete(uploadedFile).where(eq(uploadedFile.key, existing.key));
  await deleteFile(existing.key).catch(() => {});

  return { success: true };
};

export const cleanupOrphans = async ({ olderThanHours = 24 } = {}) => {
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

  const orphans = await db
    .select({ key: uploadedFile.key })
    .from(uploadedFile)
    .where(lt(uploadedFile.createdAt, cutoff));

  let deleted = 0;
  for (const { key } of orphans) {
    await deleteFile(key).catch(() => {});
    await db.delete(uploadedFile).where(eq(uploadedFile.key, key));
    deleted++;
  }

  return { deleted };
};

export const list = async ({ input }: { input: ListFilesInput }) => {
  const { prefix, limit, cursor } = input;

  const { data, error } = await tryCatch(
    listFiles({
      ...(prefix && { prefix }),
      limit,
      ...(cursor && { cursor }),
    }),
  );

  if (error) {
    if (error instanceof FilesError && error.code === "NotFound")
      throw new ORPCError("NOT_FOUND", { message: "File not found" });
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to list files",
    });
  }

  const files = data.items.map((item) => ({
    key: item.key,
    size: item.size,
    lastModified: item.lastModified,
    etag: item.etag,
    metadata: item.metadata,
  }));

  return {
    files,
    nextCursor: data.cursor,
    hasMore: !!data.cursor,
  };
};
