import { z } from "zod";

const MAX_UPLOAD_SIZE = 20 * 1024 * 1024; // 20 MB

export const uploadFileInputSchema = z.object({
  file: z.file().max(MAX_UPLOAD_SIZE, { message: "File exceeds 20 MB limit" }),
});

export const uploadFileOutputSchema = z.object({
  key: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

export const deleteUploadInputSchema = z.object({
  key: z.string().trim().min(1),
});

export const deleteUploadOutputSchema = z.object({
  success: z.boolean(),
});

export const cleanupOrphansInputSchema = z.object({
  olderThanHours: z.number().int().positive().max(720).default(24),
});

export const cleanupOrphansOutputSchema = z.object({
  deleted: z.number(),
});

export const fileMetaSchema = z.object({
  key: z.string(),
  size: z.number().optional(),
  lastModified: z.number().optional(),
  etag: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const getFileInputSchema = z.object({
  key: z.string(),
});

export const getFileOutputSchema = z.file();

// List
export const listFilesInputSchema = z.object({
  prefix: z.string().optional(),
  limit: z.number().int().positive().max(1000).default(100),
  cursor: z.string().optional(),
});

export const listFilesOutputSchema = z.object({
  files: z.array(fileMetaSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
