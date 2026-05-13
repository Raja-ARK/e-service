import type { z } from "zod";
import type {
  getFileInputSchema,
  getFileOutputSchema,
  listFilesInputSchema,
  listFilesOutputSchema,
} from "../schema/file";

export type GetFileInput = z.infer<typeof getFileInputSchema>;
export type GetFileOutput = z.infer<typeof getFileOutputSchema>;
export type ListFilesInput = z.infer<typeof listFilesInputSchema>;
export type ListFilesOutput = z.infer<typeof listFilesOutputSchema>;
