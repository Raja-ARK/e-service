import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle-zod";
import { lookupOptions } from "@e-service/db/schema/lookup";
import { z } from "zod";
import {
  filterConditionInputSchema,
  filterConditionSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  sortDirectionSchema,
} from "./shared";

export const LOOKUP_SORT_FIELDS = [
  "type",
  "code",
  "label",
  "labelAr",
  "parentType",
  "parentCode",
  "order",
  "isActive",
] as const satisfies ReadonlyArray<keyof typeof lookupOptions.$inferSelect>;

const lookupSortFieldSchema = z.enum(LOOKUP_SORT_FIELDS);

export const lookupSortSchema = z
  .array(
    z.object({
      field: lookupSortFieldSchema,
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

const codeSchema = z
  .string()
  .trim()
  .min(1, "Code is required")
  .max(100, "Code must be less than 100 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Code must be alphanumeric with _ or -");

const typeSchema = z
  .string()
  .trim()
  .min(1, "Type is required")
  .max(100, "Type must be less than 100 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Type must be alphanumeric with _ or -");

const labelSchema = z
  .string()
  .trim()
  .min(1, "Label is required")
  .max(250, "Label must be less than 250 characters");

const labelArSchema = z
  .string()
  .trim()
  .min(1, "Arabic label is required")
  .max(250, "Arabic label must be less than 250 characters");

export const lookupOptionSchema = createSelectSchema(lookupOptions);

export const lookupOptionPartialSchema = lookupOptionSchema.partial();

export const LOOKUP_SELECTABLE_COLUMNS = [
  "id",
  "type",
  "code",
  "label",
  "labelAr",
  "parentType",
  "parentCode",
  "order",
  "isActive",
  "metadata",
] as const satisfies ReadonlyArray<keyof typeof lookupOptions.$inferSelect>;

export const lookupColumnSelectSchema = z.object({
  id: z.boolean().optional(),
  type: z.boolean().optional(),
  code: z.boolean().optional(),
  label: z.boolean().optional(),
  labelAr: z.boolean().optional(),
  parentType: z.boolean().optional(),
  parentCode: z.boolean().optional(),
  order: z.boolean().optional(),
  isActive: z.boolean().optional(),
  metadata: z.boolean().optional(),
});

export const createLookupOptionSchema = createInsertSchema(lookupOptions, {
  type: typeSchema,
  code: codeSchema,
  label: labelSchema,
  labelAr: labelArSchema,
  parentType: typeSchema.optional(),
  parentCode: codeSchema.optional(),
  order: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).omit({ id: true });

export const updateLookupOptionSchema = createUpdateSchema(lookupOptions, {
  type: typeSchema.optional(),
  code: codeSchema.optional(),
  label: labelSchema.optional(),
  labelAr: labelArSchema.optional(),
  parentType: typeSchema.optional(),
  parentCode: codeSchema.optional(),
  order: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).omit({ id: true });

export const lookupIdSchema = z.object({
  id: z.string().uuid(),
});

export const getLookupOptionInputSchema = lookupIdSchema.extend({
  select: lookupColumnSelectSchema.optional(),
});

export const lookupFilterSchema = z.object({
  type: z.union([z.string(), filterConditionSchema]).optional(),
  code: z.union([z.string(), filterConditionSchema]).optional(),
  label: z.union([z.string(), filterConditionSchema]).optional(),
  labelAr: z.union([z.string(), filterConditionSchema]).optional(),
  parentType: z.union([z.string(), filterConditionSchema]).optional(),
  parentCode: z.union([z.string(), filterConditionSchema]).optional(),
  isActive: z.union([z.boolean(), filterConditionSchema]).optional(),
});

export const listLookupOptionsInputSchema = paginationQuerySchema.extend({
  filter: lookupFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: lookupSortSchema,
  select: lookupColumnSelectSchema.optional(),
  withoutPagination: z.boolean().optional().default(false),
});

export const listLookupOptionsOutputSchema = paginatedResponseSchema(
  lookupOptionPartialSchema,
);

export const lookupOptionOutputSchema = z.object({
  lookupOption: lookupOptionPartialSchema,
});

export const bulkCreateLookupOptionsSchema = z.object({
  items: z.array(createLookupOptionSchema).min(1).max(500),
});

export const bulkUpdateLookupOptionsSchema = z.object({
  items: z
    .array(lookupIdSchema.merge(updateLookupOptionSchema))
    .min(1)
    .max(500),
});

export const bulkDeleteLookupOptionsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
});

export const bulkOperationOutputSchema = z.object({
  success: z.boolean(),
  count: z.number(),
  message: z.string(),
});
