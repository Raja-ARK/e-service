import { adminProcedure, publicProcedure } from "../../";
import * as stageSchema from "../../schema/service/stage";
import { successResponseSchema } from "../../schema/shared";
import * as stageServices from "../../services/service/stage";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/",
    summary: "List Stages",
    description: "List all stages",
  })
  .input(stageSchema.listStagesInputSchema)
  .output(stageSchema.listStagesOutputSchema)
  .handler(async ({ input }) => {
    return await stageServices.listStages({ input });
  });

const getById = adminProcedure
  .route({
    method: "GET",
    path: "/{id}",
    summary: "Get Stage",
    description: "Get a stage by id",
  })
  .input(stageSchema.stageIdSchema)
  .output(stageSchema.stageResponseSchema)
  .handler(async ({ input }) => {
    return await stageServices.getStage({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/",
    summary: "Create Stage",
    description: "Create a new stage",
  })
  .input(stageSchema.createStageInputSchema)
  .output(stageSchema.stageResponseSchema)
  .handler(async ({ input, context }) => {
    return await stageServices.createStage({ input, context });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/{id}",
    summary: "Update Stage",
    description: "Update a stage by id",
  })
  .input(stageSchema.updateStageInputSchema)
  .output(stageSchema.stageResponseSchema)
  .handler(async ({ input, context }) => {
    return await stageServices.updateStage({ input, context });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/{id}",
    summary: "Delete Stage",
    description: "Delete a stage by id",
  })
  .input(stageSchema.stageIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await stageServices.deleteStage({ input });
  });

export const stageRouter = publicProcedure
  .tag("Stage")
  .prefix("/services/stages")
  .router({ list, getById, create, update, remove });
