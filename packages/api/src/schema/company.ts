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

const companySortFieldSchema = z.enum([
  "name",
  "nameAr",
  "status",
  "statusAr",
  "createdAt",
  "updatedAt",
]);

export const companySortSchema = z
  .array(
    z.object({
      field: companySortFieldSchema,
      direction: sortDirectionSchema,
    }),
  )
  .max(6)
  .optional();

export const companySchema = createSelectSchema(company);

/** Full row subset; validates list/get responses when `select` limits columns. */
export const companyPartialSchema = companySchema.partial();

export const COMPANY_SELECTABLE_COLUMNS = [
  "id",
  "name",
  "nameAr",
  "status",
  "statusAr",
  "metadata",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof company.$inferSelect>;

export const companyColumnSelectSchema = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  nameAr: z.boolean().optional(),
  status: z.boolean().optional(),
  statusAr: z.boolean().optional(),
  metadata: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
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
  /** When true, returns all matching rows (no limit/offset). Use for dropdowns. */
  withoutPagination: z.boolean().optional().default(false),
});

export const listCompaniesOutputSchema =
  paginatedResponseSchema(companyPartialSchema);

export const companyOutputSchema = z.object({
  company: companyPartialSchema,
});
