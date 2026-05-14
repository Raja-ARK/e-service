import { createSelectSchema } from "@e-service/db/drizzle-zod";
import { company } from "@e-service/db/schema/company";
import { z } from "zod";
import {
  filterConditionInputSchema,
  filterConditionSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  sortDirectionSchema,
} from "./shared";

export const COMPANY_SORT_FIELDS = [
  "name",
  "nameAr",
  "status",
  "statusAr",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof company.$inferSelect>;

const companySortFieldSchema = z.enum(COMPANY_SORT_FIELDS);

export const companySortSchema = z
  .array(
    z.object({
      field: companySortFieldSchema,
      direction: sortDirectionSchema,
    }),
  )
  .max(6)
  .optional();

export const companySchema = createSelectSchema(company).omit({
  createdAt: true,
  updatedAt: true,
});

export const companyPartialSchema = companySchema.partial();

export const COMPANY_SELECTABLE_COLUMNS = [
  "id",
  "name",
  "nameAr",
  "status",
  "statusAr",
  "metadata",
] as const satisfies ReadonlyArray<keyof typeof company.$inferSelect>;

export const companyColumnSelectSchema = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  nameAr: z.boolean().optional(),
  status: z.boolean().optional(),
  statusAr: z.boolean().optional(),
  metadata: z.boolean().optional(),
});

export const companyIdSchema = z.object({
  id: z.string(),
});

export const getCompanyInputSchema = companyIdSchema.extend({
  select: companyColumnSelectSchema.optional(),
});

export const companyFilterSchema = z.object({
  name: z.union([z.string(), filterConditionSchema]).optional(),
  nameAr: z.union([z.string(), filterConditionSchema]).optional(),
  status: z.union([z.string(), filterConditionSchema]).optional(),
  statusAr: z.union([z.string(), filterConditionSchema]).optional(),
});

export const listCompaniesInputSchema = paginationQuerySchema.extend({
  filter: companyFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: companySortSchema,
  select: companyColumnSelectSchema.optional(),
  withoutPagination: z.boolean().optional().default(false),
});

export const listCompaniesOutputSchema =
  paginatedResponseSchema(companyPartialSchema);

export const companyOutputSchema = z.object({
  company: companyPartialSchema,
});
