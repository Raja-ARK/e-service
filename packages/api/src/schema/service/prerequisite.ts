import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle/zod";
import { prerequisite } from "@e-service/db/schema/service/prerequisite";
import { z } from "zod";
import {
  filterConditionInputSchema,
  filterConditionSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  sortDirectionSchema,
} from "../shared";

const textSchema = z
  .string()
  .trim()
  .min(2, "Text must be at least 2 characters")
  .max(2000, "Text must be less than 2000 characters");

export const createPrerequisiteInputSchema = createInsertSchema(prerequisite, {
  serviceId: z.string().trim().nonempty("Service id is required"),
  text: textSchema,
  textAr: textSchema,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const updatePrerequisiteInputSchema = createUpdateSchema(prerequisite, {
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") {
          return { message: "Prerequisite id is required" };
        }
      },
    })
    .trim()
    .nonempty("Prerequisite id is required"),
  text: textSchema.optional(),
  textAr: textSchema.optional(),
}).omit({
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const prerequisiteIdSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") {
          return { message: "Prerequisite id is required" };
        }
      },
    })
    .trim()
    .nonempty("Prerequisite id is required")
    .nonoptional("Prerequisite id is required"),
});

export const PREREQUISITE_SORT_FIELDS = [
  "text",
  "textAr",
  "createdAt",
  "updatedAt",
] as const;

export const prerequisiteSortSchema = z
  .array(
    z.object({
      field: z.enum(PREREQUISITE_SORT_FIELDS),
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

export const prerequisiteFilterSchema = z.object({
  serviceId: z.union([z.string(), filterConditionSchema]).optional(),
  text: z.union([z.string(), filterConditionSchema]).optional(),
  textAr: z.union([z.string(), filterConditionSchema]).optional(),
});

export const listPrerequisitesInputSchema = paginationQuerySchema.extend({
  filter: prerequisiteFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: prerequisiteSortSchema,
  withoutPagination: z.boolean().optional().default(false),
});

export const getPrerequisiteInputSchema = prerequisiteIdSchema;

const prerequisiteOutputSchema = createSelectSchema(prerequisite).omit({
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  serviceId: true,
});

export const prerequisiteResponseSchema = z.object({
  prerequisite: prerequisiteOutputSchema,
});

export const listPrerequisitesOutputSchema = paginatedResponseSchema(
  prerequisiteOutputSchema,
);
