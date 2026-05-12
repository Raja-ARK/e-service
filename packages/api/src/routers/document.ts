import { adminProcedure } from "../";
import * as documentSchema from "../schema/document";
import { successResponseSchema } from "../schema/shared";
import * as documentServices from "../services/document";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/document-templates",
    summary: "List document templates",
    tags: ["DocumentTemplate"],
  })
  .input(documentSchema.listDocumentTemplatesInputSchema)
  .output(documentSchema.listDocumentTemplatesOutputSchema)
  .handler(async ({ input }) => {
    return await documentServices.listDocumentTemplates({ input });
  });

const getById = adminProcedure
  .route({
    method: "GET",
    path: "/document-templates/{id}",
    summary: "Get document template",
    tags: ["DocumentTemplate"],
  })
  .input(documentSchema.getDocumentTemplateInputSchema)
  .output(documentSchema.documentTemplateOutputSchema)
  .handler(async ({ input }) => {
    return await documentServices.getDocumentTemplate({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/document-templates",
    summary: "Create document template",
    tags: ["DocumentTemplate"],
  })
  .input(documentSchema.createDocumentTemplateSchema)
  .output(documentSchema.documentTemplateOutputSchema)
  .handler(async ({ input }) => {
    return await documentServices.createDocumentTemplate({ input });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/document-templates/{id}",
    summary: "Update document template",
    tags: ["DocumentTemplate"],
  })
  .input(documentSchema.updateDocumentTemplateSchema)
  .output(documentSchema.documentTemplateOutputSchema)
  .handler(async ({ input }) => {
    return await documentServices.updateDocumentTemplate({ input });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/document-templates/{id}",
    summary: "Delete document template",
    tags: ["DocumentTemplate"],
  })
  .input(documentSchema.documentTemplateIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await documentServices.deleteDocumentTemplate({ input });
  });

export const documentRouter = {
  list,
  getById,
  create,
  update,
  remove,
};
