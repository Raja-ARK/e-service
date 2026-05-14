import { adminProcedure, protectedProcedure } from "../../";
import * as prerequisiteSchema from "../../schema/service/prerequisite";
import { successResponseSchema } from "../../schema/shared";
import * as prerequisiteServices from "../../services/service/prerequisite";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/prerequisites",
    summary: "List Prerequisites",
    description: "List all prerequisites",
  })
  .input(prerequisiteSchema.listPrerequisitesInputSchema)
  .output(prerequisiteSchema.listPrerequisitesOutputSchema)
  .handler(async ({ input }) => {
    return await prerequisiteServices.listPrerequisites({ input });
  });

const getById = adminProcedure
  .route({
    method: "GET",
    path: "/prerequisites/{id}",
    summary: "Get Prerequisite",
    description: "Get a prerequisite by id",
  })
  .input(prerequisiteSchema.getPrerequisiteInputSchema)
  .output(prerequisiteSchema.prerequisiteResponseSchema)
  .handler(async ({ input }) => {
    return await prerequisiteServices.getPrerequisite({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/prerequisites",
    summary: "Create Prerequisite",
    description: "Create a new prerequisite",
  })
  .input(prerequisiteSchema.createPrerequisiteInputSchema)
  .output(prerequisiteSchema.prerequisiteResponseSchema)
  .handler(async ({ input, context }) => {
    return await prerequisiteServices.createPrerequisite({ input, context });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/prerequisites/{id}",
    summary: "Update Prerequisite",
    description: "Update a prerequisite by id",
  })
  .input(prerequisiteSchema.updatePrerequisiteInputSchema)
  .output(prerequisiteSchema.prerequisiteResponseSchema)
  .handler(async ({ input, context }) => {
    return await prerequisiteServices.updatePrerequisite({ input, context });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/prerequisites/{id}",
    summary: "Delete Prerequisite",
    description: "Delete a prerequisite by id",
  })
  .input(prerequisiteSchema.prerequisiteIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await prerequisiteServices.deletePrerequisite({ input });
  });

export const prerequisiteRouter = protectedProcedure
  .tag("Prerequisite")
  .prefix("/services/prerequisites")
  .router({
    list,
    getById,
    create,
    update,
    remove,
  });
