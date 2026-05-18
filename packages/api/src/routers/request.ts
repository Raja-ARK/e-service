import { protectedProcedure } from "..";
import * as requestSchema from "../schema/request";
import * as requests from "../services/request";

const create = protectedProcedure
  .route({
    method: "POST",
    path: "/",
    summary: "Create Request",
    tags: ["Request"],
  })
  .input(requestSchema.createRequestInputSchema)
  .output(requestSchema.requestOutputSchema)
  .handler(async ({ input, context }) => {
    return await requests.createRequest({ input, context });
  });

const update = protectedProcedure
  .route({
    method: "PUT",
    path: "/{requestNo}",
    summary: "Update Request",
    tags: ["Request"],
  })
  .input(requestSchema.updateRequestInputSchema)
  .output(requestSchema.requestOutputSchema)
  .handler(async ({ input, context }) => {
    return await requests.updateRequest({ input, context });
  });

export const requestRouter = protectedProcedure
  .tag("Request")
  .prefix("/requests")
  .router({
    create,
    update,
  });
