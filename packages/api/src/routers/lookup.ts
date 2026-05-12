import { adminProcedure, protectedProcedure } from "../";
import * as lookupSchema from "../schema/lookup";
import { successResponseSchema } from "../schema/shared";
import * as lookupServices from "../services/lookup";

const list = protectedProcedure
  .route({
    method: "GET",
    path: "/lookup-options",
    summary: "List Lookup Options",
    tags: ["Lookup"],
  })
  .input(lookupSchema.listLookupOptionsInputSchema)
  .output(lookupSchema.listLookupOptionsOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.listLookupOptions({ input });
  });

const getById = protectedProcedure
  .route({
    method: "GET",
    path: "/lookup-options/{id}",
    summary: "Get Lookup Option",
    tags: ["Lookup"],
  })
  .input(lookupSchema.getLookupOptionInputSchema)
  .output(lookupSchema.lookupOptionOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.getLookupOption({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/lookup-options",
    summary: "Create Lookup Option",
    tags: ["Lookup"],
  })
  .input(lookupSchema.createLookupOptionSchema)
  .output(lookupSchema.lookupOptionOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.createLookupOption({ input });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/lookup-options/{id}",
    summary: "Update Lookup Option",
    tags: ["Lookup"],
  })
  .input(
    lookupSchema.lookupIdSchema.merge(lookupSchema.updateLookupOptionSchema),
  )
  .output(lookupSchema.lookupOptionOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.updateLookupOption({ input });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/lookup-options/{id}",
    summary: "Delete Lookup Option",
    tags: ["Lookup"],
  })
  .input(lookupSchema.lookupIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await lookupServices.deleteLookupOption({ input });
  });

const bulkCreate = adminProcedure
  .route({
    method: "POST",
    path: "/lookup-options/bulk",
    summary: "Bulk Create Lookup Options",
    tags: ["Lookup"],
  })
  .input(lookupSchema.bulkCreateLookupOptionsSchema)
  .output(lookupSchema.bulkOperationOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.bulkCreateLookupOptions({ input });
  });

const bulkUpdate = adminProcedure
  .route({
    method: "PUT",
    path: "/lookup-options/bulk",
    summary: "Bulk Update Lookup Options",
    tags: ["Lookup"],
  })
  .input(lookupSchema.bulkUpdateLookupOptionsSchema)
  .output(lookupSchema.bulkOperationOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.bulkUpdateLookupOptions({ input });
  });

const bulkDelete = adminProcedure
  .route({
    method: "DELETE",
    path: "/lookup-options/bulk",
    summary: "Bulk Delete Lookup Options",
    tags: ["Lookup"],
  })
  .input(lookupSchema.bulkDeleteLookupOptionsSchema)
  .output(lookupSchema.bulkOperationOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.bulkDeleteLookupOptions({ input });
  });

export const lookupRouter = {
  list,
  getById,
  create,
  update,
  remove,
  bulkCreate,
  bulkUpdate,
  bulkDelete,
};
