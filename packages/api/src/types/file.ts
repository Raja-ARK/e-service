import type { z } from "zod";
import type {
  cleanupOrphansInputSchema,
  cleanupOrphansOutputSchema,
  deleteUploadInputSchema,
  deleteUploadOutputSchema,
  getFileInputSchema,
  getFileOutputSchema,
  listFilesInputSchema,
  listFilesOutputSchema,
  uploadFileInputSchema,
  uploadFileOutputSchema,
} from "../schema/file";

export type GetFileInput = z.infer<typeof getFileInputSchema>;
export type GetFileOutput = z.infer<typeof getFileOutputSchema>;
export type ListFilesInput = z.infer<typeof listFilesInputSchema>;
export type ListFilesOutput = z.infer<typeof listFilesOutputSchema>;
export type UploadFileInput = z.infer<typeof uploadFileInputSchema>;
export type UploadFileOutput = z.infer<typeof uploadFileOutputSchema>;
export type DeleteUploadInput = z.infer<typeof deleteUploadInputSchema>;
export type DeleteUploadOutput = z.infer<typeof deleteUploadOutputSchema>;
export type CleanupOrphansInput = z.infer<typeof cleanupOrphansInputSchema>;
export type CleanupOrphansOutput = z.infer<typeof cleanupOrphansOutputSchema>;
