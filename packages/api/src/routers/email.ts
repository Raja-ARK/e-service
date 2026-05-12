import { adminProcedure } from "../";
import * as emailSchema from "../schema/email";
import { successResponseSchema } from "../schema/shared";
import * as emailServices from "../services/email";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/email-templates",
    summary: "List email templates",
    tags: ["EmailTemplate"],
  })
  .input(emailSchema.listEmailTemplatesInputSchema)
  .output(emailSchema.listEmailTemplatesOutputSchema)
  .handler(async ({ input }) => {
    return await emailServices.listEmailTemplates({ input });
  });

const getById = adminProcedure
  .route({
    method: "GET",
    path: "/email-templates/{id}",
    summary: "Get email template",
    tags: ["EmailTemplate"],
  })
  .input(emailSchema.getEmailTemplateInputSchema)
  .output(emailSchema.emailTemplateOutputSchema)
  .handler(async ({ input }) => {
    return await emailServices.getEmailTemplate({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/email-templates",
    summary: "Create email template",
    tags: ["EmailTemplate"],
  })
  .input(emailSchema.createEmailTemplateSchema)
  .output(emailSchema.emailTemplateOutputSchema)
  .handler(async ({ input }) => {
    return await emailServices.createEmailTemplate({ input });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/email-templates/{id}",
    summary: "Update email template",
    tags: ["EmailTemplate"],
  })
  .input(
    emailSchema.emailTemplateIdSchema.merge(
      emailSchema.updateEmailTemplateSchema,
    ),
  )
  .output(emailSchema.emailTemplateOutputSchema)
  .handler(async ({ input }) => {
    return await emailServices.updateEmailTemplate({ input });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/email-templates/{id}",
    summary: "Delete email template",
    tags: ["EmailTemplate"],
  })
  .input(emailSchema.emailTemplateIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await emailServices.deleteEmailTemplate({ input });
  });

export const emailRouter = {
  list,
  getById,
  create,
  update,
  remove,
};
