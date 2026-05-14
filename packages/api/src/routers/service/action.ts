import { adminProcedure, publicProcedure } from "../../";
import * as stageActionSchema from "../../schema/service/action";
import { successResponseSchema } from "../../schema/shared";
import * as actionServices from "../../services/service/action";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/",
    summary: "List Actions",
    description: "List all actions",
  })
  .input(stageActionSchema.listActionsInputSchema)
  .output(stageActionSchema.listActionsOutputSchema)
  .handler(async ({ input }) => {
    return await actionServices.listActions({ input });
  });

const getById = adminProcedure
  .route({
    method: "GET",
    path: "/{id}",
    summary: "Get Action",
    description: "Get an action by id",
  })
  .input(stageActionSchema.actionIdSchema)
  .output(stageActionSchema.actionResponseSchema)
  .handler(async ({ input }) => {
    return await actionServices.getAction({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/",
    summary: "Create Action",
    description: "Create a new action",
  })
  .input(stageActionSchema.createActionInputSchema)
  .output(stageActionSchema.actionResponseSchema)
  .handler(async ({ input, context }) => {
    return await actionServices.createAction({ input, context });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/{id}",
    summary: "Update Action",
    description: "Update an action by id",
  })
  .input(stageActionSchema.updateActionInputSchema)
  .output(stageActionSchema.actionResponseSchema)
  .handler(async ({ input, context }) => {
    return await actionServices.updateAction({ input, context });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/{id}",
    summary: "Delete Action",
    description: "Delete an action by id",
  })
  .input(stageActionSchema.actionIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await actionServices.deleteAction({ input });
  });

export const actionRouter = publicProcedure
  .tag("Action")
  .prefix("/services/stages/actions")
  .router({ list, getById, create, update, remove });
