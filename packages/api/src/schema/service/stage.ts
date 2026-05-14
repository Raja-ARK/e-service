import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle/zod";
import { stage } from "@e-service/db/schema/service/stage";
import { ARABIC_NAME_REGEX } from "@e-service/shared/utils/constant";
import { z } from "zod";
import {
  filterConditionInputSchema,
  filterConditionSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  sortDirectionSchema,
} from "../shared";

const titleArSchema = z
  .string({
    error: ({ code }) => {
      if (code === "invalid_type") {
        return {
          message: "Arabic title is required",
        };
      }
    },
  })
  .trim()
  .nonempty("Arabic title is required")
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
        message: "Arabic title must be at least 2 characters long",
        input: value,
      });
      return;
    }
    if (value.length > 250) {
      issues.push({
        code: "custom",
        message: "Arabic title must be less than 250 characters long",
        input: value,
      });
      return;
    }
  });

export const createStageInputSchema = createInsertSchema(stage, {
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(250, "Title must be less than 250 characters"),
  titleAr: titleArSchema,
  serviceId: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type")
          return { message: "Service id is required" };
      },
    })
    .trim()
    .nonempty("Service id is required"),
  order: z.number().int().min(0).default(0),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const updateStageInputSchema = createUpdateSchema(stage, {
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Stage id is required" };
      },
    })
    .trim()
    .nonempty("Stage id is required"),
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(250, "Title must be less than 250 characters")
    .optional(),
  titleAr: titleArSchema.optional(),
  order: z.number().int().min(0).optional(),
}).omit({
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  serviceId: true,
});

export const stageIdSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Stage id is required" };
      },
    })
    .trim()
    .nonempty("Stage id is required"),
});

export const STAGE_SORT_FIELDS = [
  "title",
  "titleAr",
  "order",
  "isActive",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof stage.$inferSelect>;

export const stageSortSchema = z
  .array(
    z.object({
      field: z.enum(STAGE_SORT_FIELDS),
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

export const stageFilterSchema = z.object({
  serviceId: z.union([z.string(), filterConditionSchema]).optional(),
  title: z.union([z.string(), filterConditionSchema]).optional(),
  titleAr: z.union([z.string(), filterConditionSchema]).optional(),
  isActive: z.union([z.boolean(), filterConditionSchema]).optional(),
});

export const listStagesInputSchema = paginationQuerySchema.extend({
  filter: stageFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: stageSortSchema,
  withoutPagination: z.boolean().optional().default(false),
});

const stageSchema = createSelectSchema(stage).omit({
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  serviceId: true,
});

export const stageResponseSchema = z.object({
  stage: stageSchema,
});

export const listStagesOutputSchema = paginatedResponseSchema(stageSchema);
