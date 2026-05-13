import { adminProcedure, publicProcedure } from "..";
import * as fileSchema from "../schema/file";
import * as fileServices from "../services/file";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/files",
    summary: "List Files",
    tags: ["File"],
  })
  .input(fileSchema.listFilesInputSchema)
  .output(fileSchema.listFilesOutputSchema)
  .handler(async ({ input }) => {
    return await fileServices.list({ input });
  });

const getFile = publicProcedure
  .route({
    method: "GET",
    path: "/file/{+key}",
    summary: "Get File by Key",
    tags: ["File"],
  })
  .input(fileSchema.getFileInputSchema)
  .output(fileSchema.getFileOutputSchema)
  .handler(async ({ input }) => {
    return await fileServices.getFile({ input });
  });

export const fileRouter = {
  list,
  getFile,
};
