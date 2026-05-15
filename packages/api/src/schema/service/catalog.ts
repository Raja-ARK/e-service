import {
  ARABIC_NAME_REGEX,
  IMAGE_MIME_TYPES,
} from "@e-service/shared/utils/constant";
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

const arabicSchema = (label: string, maxLength: number) =>
  z
    .string()
    .trim()
    .nonempty(`${label} is required`)
    .regex(ARABIC_NAME_REGEX, `Invalid ${label}`)
    .max(maxLength, `${label} must be less than ${maxLength} characters long`);

const pointInputSchema = z.object({
  text: z
    .string()
    .trim()
    .nonempty("Point text is required")
    .max(2000, "Point text must be less than 2000 characters"),
  textAr: arabicSchema("point text", 2000),
  order: z
    .number()
    .int()
    .gte(0, "Order must be greater than or equal to 0")
    .default(0),
});

const subCatalogInputSchema = z.object({
  heading: headingSchema,
  headingAr: arabicSchema("heading", 500),
  order: z
    .number()
    .int()
    .gte(0, "Order must be greater than or equal to 0")
    .default(0),
  points: z
    .array(pointInputSchema)
    .min(1, "Sub catalog must have at least one point"),
});

export const createCatalogInputSchema = z
  .object({
    serviceId: z.string().trim().nonempty("Service id is required"),
    heading: headingSchema,
    headingAr: arabicSchema("heading", 250),
    logo: z.file().mime(IMAGE_MIME_TYPES).nullish(),
    points: z.array(pointInputSchema).optional().default([]),
    subCatalogs: z.array(subCatalogInputSchema).optional().default([]),
  })
  .check(({ issues, value }) => {
    if (value?.points?.length === 0 && value?.subCatalogs?.length === 0) {
      issues.push({
        code: "custom",
        message: "Catalog must have at least one point or sub catalog",
        input: value,
      });
    }

    if (value?.subCatalogs?.length > 0 && value?.points?.length > 0) {
      issues.push({
        code: "custom",
        message: "Catalog cannot have both points and sub catalogs",
        input: value,
      });
    }
  });

export const updateCatalogInputSchema = z
  .object({
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
    headingAr: arabicSchema("heading", 250).optional(),
    logo: z.file().mime(IMAGE_MIME_TYPES).nullish(),
    points: z.array(pointInputSchema).optional(),
    subCatalogs: z.array(subCatalogInputSchema).optional(),
  })
  .check(({ issues, value }) => {
    const pointsProvided = value?.points !== undefined;
    const subCatalogsProvided = value?.subCatalogs !== undefined;
    const pointsCount = value?.points?.length ?? 0;
    const subCatalogsCount = value?.subCatalogs?.length ?? 0;

    if (
      pointsProvided &&
      subCatalogsProvided &&
      pointsCount === 0 &&
      subCatalogsCount === 0
    ) {
      issues.push({
        code: "custom",
        message: "Catalog must have at least one point or sub catalog",
        input: value,
      });
    }

    if (pointsCount > 0 && subCatalogsCount > 0) {
      issues.push({
        code: "custom",
        message: "Catalog cannot have both points and sub catalogs",
        input: value,
      });
    }

    if (pointsProvided && pointsCount === 0 && !subCatalogsProvided) {
      issues.push({
        code: "custom",
        message:
          "Cannot clear points without providing sub catalogs replacement",
        input: value,
      });
    }

    if (subCatalogsProvided && subCatalogsCount === 0 && !pointsProvided) {
      issues.push({
        code: "custom",
        message:
          "Cannot clear sub catalogs without providing points replacement",
        input: value,
      });
    }
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

const catalogPointSchema = z.object({
  id: z.string(),
  text: z.string(),
  textAr: z.string(),
  order: z.number(),
});

const catalogSubCatalogSchema = z.object({
  id: z.string(),
  heading: z.string(),
  headingAr: z.string(),
  order: z.number(),
  points: z.array(catalogPointSchema),
});

export const catalogSchema = z.object({
  id: z.string(),
  heading: z.string(),
  headingAr: z.string(),
  logo: z.string().nullable(),
  points: z.array(catalogPointSchema),
  subCatalogs: z.array(catalogSubCatalogSchema),
});

export const getCatalogOutputSchema = z.object({
  catalog: catalogSchema,
});

export const listCatalogsOutputSchema = paginatedResponseSchema(catalogSchema);
