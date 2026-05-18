import { adminProcedure, protectedProcedure, publicProcedure } from "..";
import * as fileSchema from "../schema/file";
import * as fileServices from "../services/file";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/",
    summary: "List Files",
    description: "List all files",
  })
  .input(fileSchema.listFilesInputSchema)
  .output(fileSchema.listFilesOutputSchema)
  .handler(async ({ input }) => {
    return await fileServices.list({ input });
  });

const getFile = publicProcedure
  .route({
    method: "GET",
    path: "/{+key}",
    summary: "Get File",
    description: "Get a file by key",
  })
  .input(fileSchema.getFileInputSchema)
  .output(fileSchema.getFileOutputSchema)
  .handler(async ({ input }) => {
    return await fileServices.getFile({ input });
  });

const upload = protectedProcedure
  .route({
    method: "POST",
    path: "/upload",
    summary: "Upload File",
    description: "Upload a file and record it as a pending upload",
  })
  .input(fileSchema.uploadFileInputSchema)
  .output(fileSchema.uploadFileOutputSchema)
  .handler(async ({ input, context }) => {
    return await fileServices.upload({ input, context });
  });

const deleteUpload = protectedProcedure
  .route({
    method: "DELETE",
    path: "/upload/{+key}",
    summary: "Delete Uploaded File",
    description: "Delete an uploaded file by storage key",
  })
  .input(fileSchema.deleteUploadInputSchema)
  .output(fileSchema.deleteUploadOutputSchema)
  .handler(async ({ input, context }) => {
    return await fileServices.deleteUpload({ input, context });
  });

const cleanupOrphans = adminProcedure
  .route({
    method: "POST",
    path: "/cleanup",
    summary: "Cleanup Orphan Uploads",
    description: "Delete uploaded files older than the given threshold",
  })
  .input(fileSchema.cleanupOrphansInputSchema)
  .output(fileSchema.cleanupOrphansOutputSchema)
  .handler(async ({ input }) => {
    return await fileServices.cleanupOrphans(input);
  });

export const fileRouter = publicProcedure.tag("File").prefix("/files").router({
  list,
  getFile,
  upload,
  deleteUpload,
  cleanupOrphans,
});
