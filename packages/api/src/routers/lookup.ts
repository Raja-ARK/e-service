import { adminProcedure, protectedProcedure, publicProcedure } from "../";
import * as lookupSchema from "../schema/lookup";
import { successResponseSchema } from "../schema/shared";
import * as lookupServices from "../services/lookup";

const list = protectedProcedure
  .route({
    method: "GET",
    path: "/",
    summary: "List Lookup Options",
    description: "List all lookup options",
  })
  .input(lookupSchema.listLookupOptionsInputSchema)
  .output(lookupSchema.listLookupOptionsOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.listLookupOptions({ input });
  });

const getById = protectedProcedure
  .route({
    method: "GET",
    path: "/{id}",
    summary: "Get Lookup Option",
    description: "Get a lookup option by id",
  })
  .input(lookupSchema.getLookupOptionInputSchema)
  .output(lookupSchema.lookupOptionOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.getLookupOption({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/",
    summary: "Create Lookup Option",
    description: "Create a new lookup option",
  })
  .input(lookupSchema.createLookupOptionSchema)
  .output(lookupSchema.lookupOptionOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.createLookupOption({ input });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/{id}",
    summary: "Update Lookup Option",
    description: "Update a lookup option by id",
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
    path: "/{id}",
    summary: "Delete Lookup Option",
    description: "Delete a lookup option by id",
  })
  .input(lookupSchema.lookupIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await lookupServices.deleteLookupOption({ input });
  });

const bulkCreate = adminProcedure
  .route({
    method: "POST",
    path: "/bulk",
    summary: "Bulk Create Lookup Options",
    description: "Bulk create lookup options",
  })
  .input(lookupSchema.bulkCreateLookupOptionsSchema)
  .output(lookupSchema.bulkOperationOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.bulkCreateLookupOptions({ input });
  });

const bulkUpdate = adminProcedure
  .route({
    method: "PUT",
    path: "/bulk",
    summary: "Bulk Update Lookup Options",
    description: "Bulk update lookup options",
  })
  .input(lookupSchema.bulkUpdateLookupOptionsSchema)
  .output(lookupSchema.bulkOperationOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.bulkUpdateLookupOptions({ input });
  });

const bulkDelete = adminProcedure
  .route({
    method: "DELETE",
    path: "/bulk",
    summary: "Bulk Delete Lookup Options",
    description: "Bulk delete lookup options",
  })
  .input(lookupSchema.bulkDeleteLookupOptionsSchema)
  .output(lookupSchema.bulkOperationOutputSchema)
  .handler(async ({ input }) => {
    return await lookupServices.bulkDeleteLookupOptions({ input });
  });

export const lookupRouter = publicProcedure
  .tag("Lookup")
  .prefix("/lookups")
  .router({
    list,
    getById,
    create,
    update,
    remove,
    bulkCreate,
    bulkUpdate,
    bulkDelete,
  });
