import type { z } from "zod";
import type {
  createDocumentTemplateSchema,
  documentTemplateIdSchema,
  getDocumentTemplateInputSchema,
  listDocumentTemplatesInputSchema,
  updateDocumentTemplateSchema,
} from "../schema/document";

export type DocumentTemplateIdInput = z.infer<typeof documentTemplateIdSchema>;
export type DocumentTemplateGetInput = z.infer<
  typeof getDocumentTemplateInputSchema
>;
export type CreateDocumentTemplateInput = z.infer<
  typeof createDocumentTemplateSchema
>;
export type UpdateDocumentTemplateInput = z.infer<
  typeof updateDocumentTemplateSchema
>;
export type ListDocumentTemplatesInput = z.infer<
  typeof listDocumentTemplatesInputSchema
>;
