import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle/zod";
import {
  action,
  stageActionTypeExternalEnum,
  stageActionTypeInternalEnum,
  stageActionVariantEnum,
} from "@e-service/db/schema/service/stage";
import { ARABIC_NAME_REGEX } from "@e-service/shared/utils/constant";
import { z } from "zod";
import {
  categorySchema,
  filterConditionInputSchema,
  filterConditionSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  sortDirectionSchema,
} from "../shared";

const fieldRuleSchema = z.object({
  fieldId: z.string(),
  operator: z.enum([
    "eq",
    "neq",
    "in",
    "nin",
    "gt",
    "lt",
    "empty",
    "not_empty",
    "contains",
    "not_contains",
    "starts_with",
    "ends_with",
  ]),
  value: z
    .union([z.string(), z.array(z.string()), z.number(), z.boolean()])
    .optional(),
});
export const visibilityConditionSchema = z.union([
  z.object({
    logic: z.enum(["and", "or"]),
    rules: z.array(fieldRuleSchema),
  }),
  fieldRuleSchema,
]);
const actionAssignmentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("applicant") }),
  z.object({
    type: z.literal("internal"),
    userIds: z.array(z.string()).min(1, "At least one user id is required"),
  }),
]);

const bilingualValueSchema = z.object({
  en: z.string().trim().nonempty("English value is required"),
  ar: z.string().trim().nonempty("Arabic value is required"),
});

const actionOutcomeSchema = z.object({
  requestStatus: bilingualValueSchema.optional(),
  paymentStatus: bilingualValueSchema.optional(),
  assignment: actionAssignmentSchema.optional(),
});

const actionConditionSchema = z.object({
  statuses: z.array(z.string()).optional(),
  roles: z.array(z.enum(["external", "internal"])).optional(),
  operator: z.enum(["AND", "OR"]).optional(),
});

const skipStageSchema = z.object({
  stageId: z.string().trim().nonempty("Stage id is required"),
  condition: visibilityConditionSchema.optional().nullish(),
  outcome: actionOutcomeSchema.optional().nullish(),
});

const actionNameArSchema = z
  .string({
    error: ({ code }) => {
      if (code === "invalid_type") {
        return {
          message: "Arabic action name is required",
        };
      }
    },
  })
  .trim()
  .nonempty("Arabic action name is required")
  .check(({ issues, value }) => {
    if (value && value?.trim() !== "" && !ARABIC_NAME_REGEX.test(value)) {
      issues.push({
        code: "custom",
        message: "Invalid Arabic action name",
        input: value,
      });
      return;
    }

    if (value.length < 2) {
      issues.push({
        code: "custom",
        message: "Arabic action name must be at least 2 characters long",
        input: value,
      });
      return;
    }
    if (value.length > 250) {
      issues.push({
        code: "custom",
        message: "Arabic action name must be less than 250 characters long",
        input: value,
      });
      return;
    }
  });

export const actionVariantSchema = z.enum(stageActionVariantEnum.enumValues);

export const actionTypeExternalSchema = z.enum(
  stageActionTypeExternalEnum.enumValues,
);

export const actionTypeInternalSchema = z.enum(
  stageActionTypeInternalEnum.enumValues,
);

export const createActionInputSchema = createInsertSchema(action, {
  stageId: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Stage id is required" };
      },
    })
    .trim()
    .nonempty("Stage id is required"),
  actionName: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type")
          return { message: "Action name is required" };
      },
    })
    .trim()
    .min(2, "Action name must be at least 2 characters")
    .max(250, "Action name must be less than 250 characters"),
  actionNameAr: actionNameArSchema,
  category: categorySchema,
  actionVariant: actionVariantSchema.default("primary"),
  typeExternal: actionTypeExternalSchema.nullish(),
  typeInternal: actionTypeInternalSchema.nullish(),
  showCondition: actionConditionSchema.nullish(),
  outcome: actionOutcomeSchema.nullish(),
  skipStages: z.array(skipStageSchema).nullish().default([]),
  completeStageIds: z.array(z.string()).nullish().default([]),
  removeStageIds: z.array(z.string()).nullish().default([]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const updateActionInputSchema = createUpdateSchema(action, {
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type")
          return { message: "Action id is required" };
      },
    })
    .trim()
    .nonempty("Action id is required"),
  actionName: z
    .string()
    .trim()
    .min(2, "Action name must be at least 2 characters")
    .max(250, "Action name must be less than 250 characters")
    .optional(),
  actionNameAr: actionNameArSchema.optional(),
  category: categorySchema.optional(),
  actionVariant: actionVariantSchema.optional().default("primary"),
  typeExternal: actionTypeExternalSchema.nullish(),
  typeInternal: actionTypeInternalSchema.nullish(),
  showCondition: actionConditionSchema.nullish(),
  outcome: actionOutcomeSchema.nullish(),
  skipStages: z.array(skipStageSchema).nullish().default([]),
  completeStageIds: z.array(z.string()).nullish().default([]),
  removeStageIds: z.array(z.string()).nullish().default([]),
}).omit({
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  stageId: true,
});

export const actionIdSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type")
          return { message: "Action id is required" };
      },
    })
    .trim()
    .nonempty("Action id is required"),
});

export const ACTION_SORT_FIELDS = [
  "actionName",
  "actionNameAr",
  "category",
  "actionVariant",
  "disabled",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof action.$inferSelect>;

export const actionSortSchema = z
  .array(
    z.object({
      field: z.enum(ACTION_SORT_FIELDS),
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

export const actionFilterSchema = z.object({
  stageId: z.union([z.string(), filterConditionSchema]).optional(),
  actionName: z.union([z.string(), filterConditionSchema]).optional(),
  actionNameAr: z.union([z.string(), filterConditionSchema]).optional(),
  category: z.union([categorySchema, filterConditionSchema]).optional(),
  disabled: z.union([z.boolean(), filterConditionSchema]).optional(),
});

export const listActionsInputSchema = paginationQuerySchema.extend({
  filter: actionFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: actionSortSchema,
  withoutPagination: z.boolean().optional().default(false),
});

const actionSchema = createSelectSchema(action).omit({
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  stageId: true,
});

export const actionResponseSchema = z.object({
  action: actionSchema,
});

export const listActionsOutputSchema = paginatedResponseSchema(actionSchema);
