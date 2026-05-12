import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle-zod";
import {
  emailTemplate,
  emailTemplateTypeEnum,
} from "@e-service/db/schema/email";
import { z } from "zod";
import {
  filterConditionInputSchema,
  filterConditionSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  sortDirectionSchema,
} from "./shared";

export const EMAIL_TEMPLATE_SORT_FIELDS = [
  "name",
  "subject",
  "type",
  "isActive",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof emailTemplate.$inferSelect>;

const emailTemplateSortFieldSchema = z.enum(EMAIL_TEMPLATE_SORT_FIELDS);

export const emailTemplateSortSchema = z
  .array(
    z.object({
      field: emailTemplateSortFieldSchema,
      direction: sortDirectionSchema,
    }),
  )
  .max(6)
  .optional();

export const emailTemplateTypeSchema = z.enum(emailTemplateTypeEnum.enumValues);

const nameSchema = z.string().check(({ issues, value }) => {
  if (value === null || value === undefined || value?.trim() === "") {
    issues.push({
      code: "custom",
      message: "Name is required",
      input: value,
    });
    return;
  }

  if (value.length < 2) {
    issues.push({
      code: "custom",
      message: "Name must be at least 2 characters long",
      input: value,
    });
    return;
  }

  if (value.length > 250) {
    issues.push({
      code: "custom",
      message: "Name must be less than 250 characters long",
      input: value,
    });
  }
});

const subjectSchema = z.string().check(({ issues, value }) => {
  if (value === null || value === undefined || value?.trim() === "") {
    issues.push({
      code: "custom",
      message: "Subject is required",
      input: value,
    });
    return;
  }

  if (value.length > 500) {
    issues.push({
      code: "custom",
      message: "Subject must be less than 500 characters long",
      input: value,
    });
  }
});

const htmlSchema = z.string().check(({ issues, value }) => {
  if (value === null || value === undefined || value?.trim() === "") {
    issues.push({
      code: "custom",
      message: "HTML content is required",
      input: value,
    });
  }
});

export const emailTemplateRowSchema = createSelectSchema(emailTemplate);

/** Full row subset; validates list/get responses when `select` limits columns. */
export const emailTemplatePartialSchema = emailTemplateRowSchema.partial();

export const EMAIL_TEMPLATE_SELECTABLE_COLUMNS = [
  "id",
  "name",
  "subject",
  "html",
  "type",
  "isActive",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof emailTemplate.$inferSelect>;

export const emailTemplateColumnSelectSchema = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  subject: z.boolean().optional(),
  html: z.boolean().optional(),
  type: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
});

export const createEmailTemplateSchema = createInsertSchema(emailTemplate, {
  name: nameSchema,
  subject: subjectSchema,
  html: htmlSchema,
}).omit({
  id: true,
  type: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEmailTemplateSchema = createUpdateSchema(emailTemplate, {
  name: nameSchema.optional(),
  subject: subjectSchema.optional(),
  html: htmlSchema.optional(),
}).omit({
  id: true,
  type: true,
  createdAt: true,
  updatedAt: true,
});

export const emailTemplateIdSchema = z.object({
  id: z.string(),
});

export const getEmailTemplateInputSchema = emailTemplateIdSchema.extend({
  select: emailTemplateColumnSelectSchema.optional(),
});

export const emailTemplateFilterSchema = z.object({
  name: z.union([z.string(), filterConditionSchema]).optional(),
  subject: z.union([z.string(), filterConditionSchema]).optional(),
  type: z.union([emailTemplateTypeSchema, filterConditionSchema]).optional(),
  isActive: z.union([z.boolean(), filterConditionSchema]).optional(),
});

export const listEmailTemplatesInputSchema = paginationQuerySchema.extend({
  filter: emailTemplateFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: emailTemplateSortSchema,
  select: emailTemplateColumnSelectSchema.optional(),
  /** When true, returns all matching rows (no limit/offset). Use for dropdowns. */
  withoutPagination: z.boolean().optional().default(false),
});

export const listEmailTemplatesOutputSchema = paginatedResponseSchema(
  emailTemplatePartialSchema,
);

export const emailTemplateOutputSchema = z.object({
  emailTemplate: emailTemplatePartialSchema,
});
