import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle-zod";
import { documentTemplate } from "@e-service/db/schema/document";
import { ARABIC_NAME_REGEX } from "@e-service/shared/utils/constant";
import { z } from "zod";
import {
  filterConditionInputSchema,
  filterConditionSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  sortDirectionSchema,
} from "./shared";

export const DOCUMENT_TEMPLATE_SORT_FIELDS = [
  "name",
  "nameAr",
  "isActive",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof documentTemplate.$inferSelect>;

const documentTemplateSortFieldSchema = z.enum(DOCUMENT_TEMPLATE_SORT_FIELDS);

export const documentTemplateSortSchema = z
  .array(
    z.object({
      field: documentTemplateSortFieldSchema,
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

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

const nameArSchema = z
  .string()
  .trim()
  .max(250, "Arabic name must be less than 250 characters long")
  .optional()
  .check(({ issues, value }) => {
    if (value === undefined || value === null || value.trim() === "") return;
    if (!ARABIC_NAME_REGEX.test(value)) {
      issues.push({
        code: "custom",
        message: "Invalid Arabic name",
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

export const documentTemplateSchema = createSelectSchema(documentTemplate).omit(
  {
    createdBy: true,
    updatedBy: true,
    createdAt: true,
    updatedAt: true,
  },
);

export const documentTemplatePartialSchema = documentTemplateSchema.partial();

export const DOCUMENT_TEMPLATE_SELECTABLE_COLUMNS = [
  "id",
  "name",
  "nameAr",
  "html",
  "isActive",
] as const satisfies ReadonlyArray<keyof typeof documentTemplate.$inferSelect>;

export const documentTemplateColumnSelectSchema = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  nameAr: z.boolean().optional(),
  html: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const createDocumentTemplateSchema = createInsertSchema(
  documentTemplate,
  {
    name: nameSchema,
    nameAr: nameArSchema,
    html: htmlSchema,
  },
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const updateDocumentTemplateSchema = createUpdateSchema(
  documentTemplate,
  {
    name: nameSchema.optional(),
    nameAr: nameArSchema.optional(),
    html: htmlSchema.optional(),
    id: z
      .string()
      .trim()
      .nonempty("Document template id is required")
      .nonoptional("Document template id is required"),
  },
).omit({
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const documentTemplateIdSchema = z.object({
  id: z
    .string()
    .trim()
    .nonempty("Document template id is required")
    .nonoptional("Document template id is required"),
});

export const getDocumentTemplateInputSchema = documentTemplateIdSchema.extend({
  select: documentTemplateColumnSelectSchema.optional(),
});

export const documentTemplateFilterSchema = z.object({
  name: z.union([z.string(), filterConditionSchema]).optional(),
  nameAr: z.union([z.string(), filterConditionSchema]).optional(),
  isActive: z.union([z.boolean(), filterConditionSchema]).optional(),
});

export const listDocumentTemplatesInputSchema = paginationQuerySchema.extend({
  filter: documentTemplateFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: documentTemplateSortSchema,
  select: documentTemplateColumnSelectSchema.optional(),
  withoutPagination: z.boolean().optional().default(false),
});

export const listDocumentTemplatesOutputSchema = paginatedResponseSchema(
  documentTemplatePartialSchema,
);

export const documentTemplateOutputSchema = z.object({
  documentTemplate: documentTemplatePartialSchema,
});
