import { adminProcedure, protectedProcedure } from "../";
import * as documentSchema from "../schema/document";
import { successResponseSchema } from "../schema/shared";
import * as documentServices from "../services/document";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/",
    summary: "List document templates",
    description: "List all document templates",
  })
  .input(documentSchema.listDocumentTemplatesInputSchema)
  .output(documentSchema.listDocumentTemplatesOutputSchema)
  .handler(async ({ input }) => {
    return await documentServices.listDocumentTemplates({ input });
  });

const getById = adminProcedure
  .route({
    method: "GET",
    path: "/{id}",
    summary: "Get document template",
    description: "Get a document template by id",
  })
  .input(documentSchema.getDocumentTemplateInputSchema)
  .output(documentSchema.documentTemplateOutputSchema)
  .handler(async ({ input }) => {
    return await documentServices.getDocumentTemplate({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/",
    summary: "Create document template",
    description: "Create a new document template",
  })
  .input(documentSchema.createDocumentTemplateSchema)
  .output(documentSchema.documentTemplateOutputSchema)
  .handler(async ({ input, context }) => {
    return await documentServices.createDocumentTemplate({ input, context });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/{id}",
    summary: "Update document template",
    description: "Update a document template by id",
  })
  .input(documentSchema.updateDocumentTemplateSchema)
  .output(documentSchema.documentTemplateOutputSchema)
  .handler(async ({ input, context }) => {
    return await documentServices.updateDocumentTemplate({ input, context });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/{id}",
    summary: "Delete document template",
    description: "Delete a document template by id",
  })
  .input(documentSchema.documentTemplateIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await documentServices.deleteDocumentTemplate({ input });
  });

export const documentRouter = protectedProcedure
  .tag("Document Template")
  .prefix("/document-templates")
  .router({
    list,
    getById,
    create,
    update,
    remove,
  });
