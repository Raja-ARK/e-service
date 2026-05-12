import type { z } from "zod";
import type {
  createEmailTemplateSchema,
  emailTemplateIdSchema,
  getEmailTemplateInputSchema,
  listEmailTemplatesInputSchema,
  updateEmailTemplateSchema,
} from "../schema/email";

export type EmailTemplateIdInput = z.infer<typeof emailTemplateIdSchema>;
export type EmailTemplateGetInput = z.infer<typeof getEmailTemplateInputSchema>;
export type CreateEmailTemplateInput = z.infer<
  typeof createEmailTemplateSchema
>;
export type UpdateEmailTemplateInput = z.infer<
  typeof updateEmailTemplateSchema
>;
export type ListEmailTemplatesInput = z.infer<
  typeof listEmailTemplatesInputSchema
>;
