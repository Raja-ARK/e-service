import { IMAGE_MIME_TYPES } from "@e-service/shared/utils/constant";
import { z } from "zod";
import {
  filterConditionInputSchema,
  filterConditionSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  sortDirectionSchema,
} from "../shared";

const headingSchema = z
  .string()
  .trim()
  .min(2, "Heading must be at least 2 characters")
  .max(500, "Heading must be less than 500 characters");

const pointInputSchema = z.object({
  text: z
    .string()
    .trim()
    .nonempty("Point text is required")
    .max(2000, "Point text must be less than 2000 characters"),
  textAr: z
    .string()
    .trim()
    .nonempty("Arabic point text is required")
    .max(2000, "Arabic point text must be less than 2000 characters"),
  order: z.number().int().min(0).default(0),
});

const subCatalogInputSchema = z.object({
  heading: headingSchema,
  headingAr: headingSchema,
  order: z.number().int().min(0).default(0),
  points: z
    .array(pointInputSchema)
    .min(1, "Subcatalog must have at least one point"),
});

export const createCatalogInputSchema = z
  .object({
    serviceId: z.string().trim().nonempty("Service id is required"),
    heading: headingSchema,
    headingAr: headingSchema,
    logo: z.file().mime(IMAGE_MIME_TYPES).nullish(),
    points: z.array(pointInputSchema).optional().default([]),
    subCatalogs: z.array(subCatalogInputSchema).optional().default([]),
  })
  .check(({ issues, value }) => {
    if (value?.points?.length === 0 && value?.subCatalogs?.length === 0) {
      issues.push({
        code: "custom",
        message: "Catalog must have at least one point or subcatalog",
        input: value,
      });
    }
  });

export const updateCatalogInputSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") {
          return {
            message: "Catalog id is required",
          };
        }
      },
    })
    .trim()
    .nonempty("Catalog id is required")
    .nonoptional("Catalog id is required"),
  heading: headingSchema.optional(),
  headingAr: headingSchema.optional(),
  logo: z.file().mime(IMAGE_MIME_TYPES).nullish(),
  points: z.array(pointInputSchema).optional(),
  subCatalogs: z.array(subCatalogInputSchema).optional(),
});

export const catalogIdSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") {
          return {
            message: "Catalog id is required",
          };
        }
      },
    })
    .trim()
    .nonempty("Catalog id is required"),
});

export const CATALOG_SORT_FIELDS = [
  "heading",
  "headingAr",
  "createdAt",
  "updatedAt",
] as const;

export const catalogSortSchema = z
  .array(
    z.object({
      field: z.enum(CATALOG_SORT_FIELDS),
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

export const catalogFilterSchema = z.object({
  serviceId: z.union([z.string(), filterConditionSchema]).optional(),
  heading: z.union([z.string(), filterConditionSchema]).optional(),
  headingAr: z.union([z.string(), filterConditionSchema]).optional(),
});

export const listCatalogsInputSchema = paginationQuerySchema.extend({
  filter: catalogFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: catalogSortSchema,
  withoutPagination: z.boolean().optional().default(false),
});

// --- Output schemas ---

const catalogPointOutputSchema = z.object({
  id: z.string(),
  text: z.string(),
  textAr: z.string(),
  order: z.number(),
  catalogId: z.string().nullable(),
  subCatalogId: z.string().nullable(),
});

const catalogSubCatalogOutputSchema = z.object({
  id: z.string(),
  heading: z.string(),
  headingAr: z.string(),
  order: z.number(),
  catalogId: z.string(),
  points: z.array(catalogPointOutputSchema),
});

export const catalogOutputSchema = z.object({
  id: z.string(),
  heading: z.string(),
  headingAr: z.string(),
  logo: z.string().nullable(),
  serviceId: z.string(),
  points: z.array(catalogPointOutputSchema),
  subCatalogs: z.array(catalogSubCatalogOutputSchema),
});

export const getCatalogOutputSchema = z.object({
  catalog: catalogOutputSchema,
});

export const listCatalogsOutputSchema =
  paginatedResponseSchema(catalogOutputSchema);
