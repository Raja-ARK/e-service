import { adminProcedure } from "../../";
import * as prerequisiteSchema from "../../schema/service/prerequisite";
import { successResponseSchema } from "../../schema/shared";
import * as prerequisiteServices from "../../services/service/prerequisite";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/prerequisites",
    summary: "List Prerequisites",
    tags: ["Prerequisite"],
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
    tags: ["Prerequisite"],
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
    tags: ["Prerequisite"],
  })
  .input(prerequisiteSchema.createPrerequisiteInputSchema)
  .output(prerequisiteSchema.prerequisiteResponseSchema)
  .handler(async ({ input }) => {
    return await prerequisiteServices.createPrerequisite({ input });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/prerequisites/{id}",
    summary: "Update Prerequisite",
    tags: ["Prerequisite"],
  })
  .input(prerequisiteSchema.updatePrerequisiteInputSchema)
  .output(prerequisiteSchema.prerequisiteResponseSchema)
  .handler(async ({ input }) => {
    return await prerequisiteServices.updatePrerequisite({ input });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/prerequisites/{id}",
    summary: "Delete Prerequisite",
    tags: ["Prerequisite"],
  })
  .input(prerequisiteSchema.prerequisiteIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await prerequisiteServices.deletePrerequisite({ input });
  });

export const prerequisiteRouter = {
  list,
  getById,
  create,
  update,
  remove,
};
