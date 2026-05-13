import { adminProcedure, publicProcedure } from "../../";
import * as catalogSchema from "../../schema/service/catalog";
import { successResponseSchema } from "../../schema/shared";
import * as catalogServices from "../../services/service/catalog";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/",
    summary: "List Catalogs",
    description: "List all catalogs",
  })
  .input(catalogSchema.listCatalogsInputSchema)
  .output(catalogSchema.listCatalogsOutputSchema)
  .handler(async ({ input }) => {
    return await catalogServices.listCatalogs({ input });
  });

const getById = adminProcedure
  .route({
    method: "GET",
    path: "/{id}",
    summary: "Get Catalog",
    description: "Get a catalog by id",
  })
  .input(catalogSchema.catalogIdSchema)
  .output(catalogSchema.getCatalogOutputSchema)
  .handler(async ({ input }) => {
    return await catalogServices.getCatalog({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/",
    summary: "Create Catalog",
    description: "Create a new catalog",
  })
  .input(catalogSchema.createCatalogInputSchema)
  .output(catalogSchema.getCatalogOutputSchema)
  .handler(async ({ input }) => {
    return await catalogServices.createCatalog({ input });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/{id}",
    summary: "Update Catalog",
    description: "Update a catalog by id",
  })
  .input(catalogSchema.updateCatalogInputSchema)
  .output(catalogSchema.getCatalogOutputSchema)
  .handler(async ({ input }) => {
    return await catalogServices.updateCatalog({ input });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/{id}",
    summary: "Delete Catalog",
    description: "Delete a catalog by id",
  })
  .input(catalogSchema.catalogIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await catalogServices.deleteCatalog({ input });
  });

export const catalogRouter = publicProcedure
  .tag("Catalog")
  .prefix("/catalogs")
  .router({
    list,
    getById,
    create,
    update,
    remove,
  });
