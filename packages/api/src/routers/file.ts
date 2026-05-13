import { adminProcedure, publicProcedure } from "..";
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

export const fileRouter = publicProcedure.tag("File").prefix("/files").router({
  list,
  getFile,
});
