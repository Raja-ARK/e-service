import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle/zod";
import { service } from "@e-service/db/schema/service/service";
import { serviceCompletionStatusSchema } from "@e-service/shared/schema";
import {
  ARABIC_NAME_REGEX,
  IMAGE_MIME_TYPES,
} from "@e-service/shared/utils/constant";
import z from "zod";
import {
  categorySchema,
  filterConditionInputSchema,
  filterConditionSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  sortDirectionSchema,
} from "../shared";

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
    return;
  }
});

const nameArSchema = z
  .string({
    error: ({ code }) => {
      if (code === "invalid_type") {
        return {
          message: "Arabic name is required",
        };
      }
    },
  })
  .trim()
  .nonempty("Arabic name is required")
  .check(({ issues, value }) => {
    if (value && value?.trim() !== "" && !ARABIC_NAME_REGEX.test(value)) {
      issues.push({
        code: "custom",
        message: "Invalid Arabic name",
        input: value,
      });
      return;
    }

    if (value.length < 2) {
      issues.push({
        code: "custom",
        message: "Arabic name must be at least 2 characters long",
        input: value,
      });
      return;
    }
    if (value.length > 250) {
      issues.push({
        code: "custom",
        message: "Arabic name must be less than 250 characters long",
        input: value,
      });
      return;
    }
  });

export const createServiceInputSchema = createInsertSchema(service, {
  logo: z.file().mime(IMAGE_MIME_TYPES),
  name: nameSchema,
  nameAr: nameArSchema,
  description: z
    .string()
    .trim()
    .nonempty("Description is required")
    .nonoptional("Description is required"),
  descriptionAr: z
    .string()
    .regex(ARABIC_NAME_REGEX, "Invalid Arabic description")
    .trim()
    .nonempty("Arabic description is required")
    .nonoptional("Arabic description is required"),
  serviceCode: z
    .string()
    .trim()
    .nonempty("Service code is required")
    .nonoptional("Service code is required"),
  completionStatus: serviceCompletionStatusSchema.optional().nullish(),
  completionScript: z
    .array(
      z.object({
        type: categorySchema,
        script: z
          .string({
            error: ({ code }) => {
              if (code === "invalid_type") {
                return {
                  message: "Script is required",
                };
              }
            },
          })
          .trim()
          .nonempty("Script is required")
          .nonoptional("Script is required"),
      }),
    )
    .optional()
    .nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const updateServiceInputSchema = createUpdateSchema(service, {
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") {
          return {
            message: "Service id is required",
          };
        }
      },
    })
    .trim()
    .nonempty("Service id is required")
    .nonoptional("Service id is required"),
  logo: z.file().mime(IMAGE_MIME_TYPES).optional(),
  name: nameSchema.optional(),
  nameAr: nameArSchema.optional(),
  description: z
    .string()
    .trim()
    .nonempty("Description is required")
    .nonoptional("Description is required")
    .optional(),
  descriptionAr: z
    .string()
    .regex(ARABIC_NAME_REGEX, "Invalid Arabic description")
    .trim()
    .nonempty("Arabic description is required")
    .nonoptional("Arabic description is required")
    .optional(),
  serviceCode: z
    .string()
    .trim()
    .nonempty("Service code is required")
    .nonoptional("Service code is required")
    .optional(),
  completionStatus: serviceCompletionStatusSchema.optional().nullish(),
  completionScript: z
    .array(
      z.object({
        type: categorySchema,
        script: z
          .string({
            error: ({ code }) => {
              if (code === "invalid_type") {
                return {
                  message: "Script is required",
                };
              }
            },
          })
          .trim()
          .nonempty("Script is required")
          .nonoptional("Script is required"),
      }),
    )
    .optional()
    .nullish(),
}).omit({
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const deleteServiceInputSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") {
          return {
            message: "Service id is required",
          };
        }
      },
    })
    .trim()
    .nonempty("Service id is required")
    .nonoptional("Service id is required"),
});

export const serviceIdSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") {
          return {
            message: "Service id is required",
          };
        }
      },
    })
    .trim()
    .nonempty("Service id is required")
    .nonoptional("Service id is required"),
});

export const SERVICE_SORT_FIELDS = [
  "name",
  "nameAr",
  "isActive",
  "serviceCode",
  "processDays",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof service.$inferSelect>;

export const serviceSortSchema = z
  .array(
    z.object({
      field: z.enum(SERVICE_SORT_FIELDS),
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

export const SERVICE_SELECTABLE_COLUMNS = [
  "id",
  "name",
  "nameAr",
  "logo",
  "description",
  "descriptionAr",
  "isActive",
  "serviceCode",
  "departmentId",
  "category",
  "prefix",
  "processDays",
  "outputDocumentId",
  "outputDocName",
  "outputDocNameAr",
  "eligibleBy",
  "eligibleStatus",
  "completionStatus",
  "registerCompany",
  "completionScript",
] as const satisfies ReadonlyArray<keyof typeof service.$inferSelect>;

export const serviceColumnSelectSchema = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  nameAr: z.boolean().optional(),
  logo: z.boolean().optional(),
  description: z.boolean().optional(),
  descriptionAr: z.boolean().optional(),
  isActive: z.boolean().optional(),
  serviceCode: z.boolean().optional(),
  departmentId: z.boolean().optional(),
  category: z.boolean().optional(),
  prefix: z.boolean().optional(),
  processDays: z.boolean().optional(),
  outputDocumentId: z.boolean().optional(),
  outputDocName: z.boolean().optional(),
  outputDocNameAr: z.boolean().optional(),
  eligibleBy: z.boolean().optional(),
  eligibleStatus: z.boolean().optional(),
  completionStatus: z.boolean().optional(),
  registerCompany: z.boolean().optional(),
  completionScript: z.boolean().optional(),
});

export const serviceFilterSchema = z.object({
  name: z.union([z.string(), filterConditionSchema]).optional(),
  nameAr: z.union([z.string(), filterConditionSchema]).optional(),
  isActive: z.union([z.boolean(), filterConditionSchema]).optional(),
  serviceCode: z.union([z.string(), filterConditionSchema]).optional(),
  departmentId: z.union([z.string(), filterConditionSchema]).optional(),
  category: z.union([categorySchema, filterConditionSchema]).optional(),
});

export const listServicesInputSchema = paginationQuerySchema.extend({
  filter: serviceFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: serviceSortSchema,
  select: serviceColumnSelectSchema.optional(),
  withoutPagination: z.boolean().optional().default(false),
});

export const getServiceInputSchema = serviceIdSchema.extend({
  select: serviceColumnSelectSchema.optional(),
});

export const serviceSchema = createSelectSchema(service).omit({
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const servicePartialSchema = serviceSchema.partial();

export const listServicesOutputSchema =
  paginatedResponseSchema(servicePartialSchema);

export const serviceOutputSchema = z.object({
  service: servicePartialSchema,
});
