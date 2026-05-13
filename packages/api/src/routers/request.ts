import { protectedProcedure } from "..";
import * as requestSchema from "../schema/request";
import * as requests from "../services/request";

const create = protectedProcedure
  .route({
    method: "POST",
    path: "/requests",
    summary: "Create Request",
    tags: ["Request"],
  })
  .input(requestSchema.createRequestInputSchema)
  .output(requestSchema.createRequestOutputSchema)
  .handler(async ({ input }) => {
    return await requests.createRequest({ input });
  });

export const requestRouter = {
  create,
};
