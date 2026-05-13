import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle-zod";
import { department } from "@e-service/db/schema/department";
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
} from "./shared";

export const DEPARTMENT_SORT_FIELDS = [
  "name",
  "nameAr",
  "isActive",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof department.$inferSelect>;

const departmentSortFieldSchema = z.enum(DEPARTMENT_SORT_FIELDS);

export const departmentSortSchema = z
  .array(
    z.object({
      field: departmentSortFieldSchema,
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

export const departmentSchema = createSelectSchema(department);

/** Full row subset; validates list/get responses when `select` limits columns. */
export const departmentPartialSchema = departmentSchema.partial();

export const DEPARTMENT_SELECTABLE_COLUMNS = [
  "id",
  "name",
  "nameAr",
  "isActive",
  "description",
  "descriptionAr",
  "logo",
] as const satisfies ReadonlyArray<keyof typeof department.$inferSelect>;

export const departmentColumnSelectSchema = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  nameAr: z.boolean().optional(),
  isActive: z.boolean().optional(),
  description: z.boolean().optional(),
  descriptionAr: z.boolean().optional(),
  logo: z.boolean().optional(),
});

export const createDepartmentSchema = createInsertSchema(department, {
  name: nameSchema,
  nameAr: nameArSchema,
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  logo: z.file().mime(IMAGE_MIME_TYPES).optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const updateDepartmentSchema = createUpdateSchema(department, {
  name: nameSchema.optional(),
  nameAr: nameArSchema.optional(),
  logo: z.file().mime(IMAGE_MIME_TYPES).optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const departmentIdSchema = z.object({
  id: z.string(),
});

export const getDepartmentInputSchema = departmentIdSchema.extend({
  select: departmentColumnSelectSchema.optional(),
});

export const departmentFilterSchema = z.object({
  name: z.union([z.string(), filterConditionSchema]).optional(),
  nameAr: z.union([z.string(), filterConditionSchema]).optional(),
  isActive: z.union([z.boolean(), filterConditionSchema]).optional(),
});

export const listDepartmentsInputSchema = paginationQuerySchema.extend({
  filter: departmentFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: departmentSortSchema,
  select: departmentColumnSelectSchema.optional(),
  /** When true, returns all matching rows (no limit/offset). Use for dropdowns. */
  withoutPagination: z.boolean().optional().default(false),
});

export const listDepartmentsOutputSchema = paginatedResponseSchema(
  departmentPartialSchema,
);

export const departmentOutputSchema = z.object({
  department: departmentPartialSchema,
});
