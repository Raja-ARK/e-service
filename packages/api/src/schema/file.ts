import { z } from "zod";

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
