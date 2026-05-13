import { tryCatch } from "@e-service/shared/utils/try-catch";
import { downloadFile, FilesError, listFiles } from "@e-service/storage";
import { ORPCError } from "@orpc/server";
import type { GetFileInput, ListFilesInput } from "../types/file";

export const getFile = async ({ input }: { input: GetFileInput }) => {
  const { data, error } = await tryCatch(downloadFile(input.key));

  if (error) {
    if (error instanceof FilesError && error.code === "NotFound")
      throw new ORPCError("NOT_FOUND", { message: "File not found" });
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to get file",
    });
  }

  console.log(data, error);

  const originalName =
    data.metadata?.originalName ?? input.key.split("/").pop() ?? input.key;
  const blob = await data.blob();
  return new File([blob], originalName, { type: data.type });
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
