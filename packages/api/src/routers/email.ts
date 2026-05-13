import { adminProcedure, publicProcedure } from "../";
import * as emailSchema from "../schema/email";
import { successResponseSchema } from "../schema/shared";
import * as emailServices from "../services/email";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/",
    summary: "List email templates",
    description: "List all email templates",
  })
  .input(emailSchema.listEmailTemplatesInputSchema)
  .output(emailSchema.listEmailTemplatesOutputSchema)
  .handler(async ({ input }) => {
    return await emailServices.listEmailTemplates({ input });
  });

const getById = adminProcedure
  .route({
    method: "GET",
    path: "/{id}",
    summary: "Get email template",
    description: "Get an email template by id",
  })
  .input(emailSchema.getEmailTemplateInputSchema)
  .output(emailSchema.emailTemplateOutputSchema)
  .handler(async ({ input }) => {
    return await emailServices.getEmailTemplate({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/",
    summary: "Create email template",
    description: "Create a new email template",
  })
  .input(emailSchema.createEmailTemplateSchema)
  .output(emailSchema.emailTemplateOutputSchema)
  .handler(async ({ input, context }) => {
    return await emailServices.createEmailTemplate({ input, context });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/{id}",
    summary: "Update email template",
    description: "Update an email template by id",
  })
  .input(
    emailSchema.emailTemplateIdSchema.merge(
      emailSchema.updateEmailTemplateSchema,
    ),
  )
  .output(emailSchema.emailTemplateOutputSchema)
  .handler(async ({ input, context }) => {
    return await emailServices.updateEmailTemplate({ input, context });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/{id}",
    summary: "Delete email template",
    description: "Delete an email template by id",
  })
  .input(emailSchema.emailTemplateIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await emailServices.deleteEmailTemplate({ input });
  });

export const emailRouter = publicProcedure
  .tag("Email Template")
  .prefix("/email-templates")
  .router({
    list,
    getById,
    create,
    update,
    remove,
  });
