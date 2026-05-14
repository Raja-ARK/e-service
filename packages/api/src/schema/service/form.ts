import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle/zod";
import {
  fieldTypeEnum,
  formField,
  formGroup,
  formRule,
  formStep,
  formTemplateTypeEnum,
  formTypeEnum,
  ruleTriggerEnum,
  stepTypeEnum,
} from "@e-service/db/schema/service/form";
import { IMAGE_MIME_TYPES } from "@e-service/shared/utils/constant";
import { z } from "zod";
import {
  filterConditionInputSchema,
  filterConditionSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  portalTypeSchema,
  sortDirectionSchema,
} from "../shared";
import { visibilityConditionSchema } from "./action";

const idString = (label: string) =>
  z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: `${label} is required` };
      },
    })
    .trim()
    .nonempty(`${label} is required`);

const iconFileSchema = z.file().mime(IMAGE_MIME_TYPES).nullish();

const stageIdsSchema = z.array(z.string()).optional().default([]);

export const formTypeSchema = z.enum(formTypeEnum.enumValues);
export const stepTypeSchema = z.enum(stepTypeEnum.enumValues);
export const formTemplateTypeSchema = z.enum(formTemplateTypeEnum.enumValues);
export const fieldTypeSchema = z.enum(fieldTypeEnum.enumValues);
export const ruleTriggerSchema = z.enum(ruleTriggerEnum.enumValues);

// --- Field config (jsonb) ---

const fieldWidthSchema = z.enum(["100%", "50%", "33.33%", "66.66%"]);
const fieldAlignmentSchema = z.enum(["left", "top"]);

const fieldDefaultValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.tuple([z.string(), z.string()]),
  z.array(z.string()),
  z.array(z.number()),
]);

export const fieldConfigSchema = z.object({
  required: z.boolean().nullable(),
  disabled: z.boolean().nullable(),
  minLength: z.number().nullable(),
  maxLength: z.number().nullable(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  defaultValue: fieldDefaultValueSchema.nullable(),
  fieldWidth: fieldWidthSchema,
  fieldAlignment: fieldAlignmentSchema,
  description: z.string().nullable(),
  descriptionAr: z.string().nullable(),
  prefixIcon: z.string().nullable(),
  suffixIcon: z.string().nullable(),
  maxFileSize: z.number(),
  allowedFileTypes: z.array(z.string()),
  maxFileCount: z.number(),
  pattern: z.string().nullable(),
  patternMessage: z.string().nullable(),
  patternMessageAr: z.string().nullable(),
  multiple: z.boolean().nullable(),
});

// --- Rule action / value expression (jsonb) ---

const ruleActionSchema: z.ZodType = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("set_value"),
      fieldId: z.string(),
      value: valueExpressionSchema,
    }),
    z.object({ type: z.literal("clear"), fieldId: z.string() }),
    z.object({ type: z.literal("show"), fieldId: z.string() }),
    z.object({ type: z.literal("hide"), fieldId: z.string() }),
    z.object({ type: z.literal("enable"), fieldId: z.string() }),
    z.object({ type: z.literal("disable"), fieldId: z.string() }),
    z.object({ type: z.literal("set_required"), fieldId: z.string() }),
    z.object({ type: z.literal("set_optional"), fieldId: z.string() }),
    z.object({
      type: z.literal("validate"),
      fieldId: z.string(),
      message: z.string(),
      messageAr: z.string(),
    }),
  ]),
);

const valueExpressionSchema: z.ZodType = z.lazy(() => z.any());

// --- Form ---

export const getFormByServiceInputSchema = z.object({
  serviceId: idString("Service id"),
});

// --- Step ---

const stepBase = createInsertSchema(formStep, {
  serviceId: idString("Service id"),
  code: z.string().trim().min(1, "Code is required"),
  title: z.string().trim().min(1, "Title is required"),
  titleAr: z.string().trim().min(1, "Arabic title is required"),
  order: z.number().int().min(0).default(0),
  hideFor: portalTypeSchema.nullish(),
  color: z.string().nullish(),
  type: formTypeSchema.default("step"),
  stepType: stepTypeSchema.default("normal"),
  templateType: formTemplateTypeSchema.default("normal"),
  visibilityCondition: visibilityConditionSchema.nullish(),
}).omit({
  id: true,
  icon: true,
  createdAt: true,
  updatedAt: true,
});

export const createStepInputSchema = stepBase.extend({
  icon: iconFileSchema,
  stageIds: stageIdsSchema,
});

export const updateStepInputSchema = createUpdateSchema(formStep, {
  id: idString("Step id"),
  code: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  titleAr: z.string().trim().min(1).optional(),
  order: z.number().int().min(0).optional(),
  hideFor: portalTypeSchema.nullish(),
  color: z.string().nullish(),
  type: formTypeSchema.optional(),
  stepType: stepTypeSchema.optional(),
  templateType: formTemplateTypeSchema.optional(),
  visibilityCondition: visibilityConditionSchema.nullish(),
})
  .omit({ icon: true, createdAt: true, updatedAt: true, serviceId: true })
  .extend({
    icon: iconFileSchema,
    stageIds: z.array(z.string()).optional(),
  });

export const stepIdSchema = z.object({ id: idString("Step id") });

export const STEP_SORT_FIELDS = [
  "code",
  "title",
  "titleAr",
  "order",
  "createdAt",
  "updatedAt",
] as const;

export const stepSortSchema = z
  .array(
    z.object({
      field: z.enum(STEP_SORT_FIELDS),
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

export const listStepsInputSchema = paginationQuerySchema.extend({
  filter: z
    .object({
      serviceId: z.union([z.string(), filterConditionSchema]).optional(),
      code: z.union([z.string(), filterConditionSchema]).optional(),
      title: z.union([z.string(), filterConditionSchema]).optional(),
      titleAr: z.union([z.string(), filterConditionSchema]).optional(),
      type: z.union([formTypeSchema, filterConditionSchema]).optional(),
    })
    .optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: stepSortSchema,
  withoutPagination: z.boolean().optional().default(false),
});

// --- Group ---

const groupBase = createInsertSchema(formGroup, {
  stepId: idString("Step id"),
  label: z.string().trim().min(1, "Label is required"),
  labelAr: z.string().trim().min(1, "Arabic label is required"),
  order: z.number().int().min(0).default(0),
  hideFor: portalTypeSchema.nullish(),
  templateType: formTemplateTypeSchema.default("normal"),
  visibilityCondition: visibilityConditionSchema.nullish(),
}).omit({
  id: true,
  icon: true,
  createdAt: true,
  updatedAt: true,
});

export const createGroupInputSchema = groupBase.extend({
  icon: iconFileSchema,
  stageIds: stageIdsSchema,
});

export const updateGroupInputSchema = createUpdateSchema(formGroup, {
  id: idString("Group id"),
  label: z.string().trim().min(1).optional(),
  labelAr: z.string().trim().min(1).optional(),
  order: z.number().int().min(0).optional(),
  hideFor: portalTypeSchema.nullish(),
  templateType: formTemplateTypeSchema.optional(),
  visibilityCondition: visibilityConditionSchema.nullish(),
})
  .omit({ icon: true, createdAt: true, updatedAt: true, stepId: true })
  .extend({
    icon: iconFileSchema,
    stageIds: z.array(z.string()).optional(),
  });

export const groupIdSchema = z.object({ id: idString("Group id") });

export const GROUP_SORT_FIELDS = [
  "label",
  "labelAr",
  "order",
  "createdAt",
  "updatedAt",
] as const;

export const groupSortSchema = z
  .array(
    z.object({
      field: z.enum(GROUP_SORT_FIELDS),
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

export const listGroupsInputSchema = paginationQuerySchema.extend({
  filter: z
    .object({
      stepId: z.union([z.string(), filterConditionSchema]).optional(),
      label: z.union([z.string(), filterConditionSchema]).optional(),
      labelAr: z.union([z.string(), filterConditionSchema]).optional(),
    })
    .optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: groupSortSchema,
  withoutPagination: z.boolean().optional().default(false),
});

// --- Field ---

const fieldBase = createInsertSchema(formField, {
  code: z.string().trim().min(1, "Code is required"),
  stepId: z.string().nullish(),
  groupId: z.string().nullish(),
  label: z.string().trim().min(1, "Label is required"),
  labelAr: z.string().trim().min(1, "Arabic label is required"),
  placeholder: z.string().nullish(),
  placeholderAr: z.string().nullish(),
  helperText: z.string().nullish(),
  helperTextAr: z.string().nullish(),
  type: fieldTypeSchema,
  order: z.number().int().min(0).default(0),
  visibilityCondition: visibilityConditionSchema.nullish(),
  hideFor: portalTypeSchema.nullish(),
  config: fieldConfigSchema.optional(),
  canEditInInternal: z.boolean().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createFieldInputSchema = fieldBase
  .extend({
    prefixIcon: iconFileSchema,
    suffixIcon: iconFileSchema,
    stageIds: stageIdsSchema,
  })
  .check(({ issues, value }) => {
    if (!value.stepId && !value.groupId) {
      issues.push({
        code: "custom",
        message: "Field must belong to a step or a group",
        input: value,
      });
    }
  });

export const updateFieldInputSchema = createUpdateSchema(formField, {
  id: idString("Field id"),
  code: z.string().trim().min(1).optional(),
  stepId: z.string().nullish(),
  groupId: z.string().nullish(),
  label: z.string().trim().min(1).optional(),
  labelAr: z.string().trim().min(1).optional(),
  placeholder: z.string().nullish(),
  placeholderAr: z.string().nullish(),
  helperText: z.string().nullish(),
  helperTextAr: z.string().nullish(),
  type: fieldTypeSchema.optional(),
  order: z.number().int().min(0).optional(),
  visibilityCondition: visibilityConditionSchema.nullish(),
  hideFor: portalTypeSchema.nullish(),
  config: fieldConfigSchema.partial().optional(),
  canEditInInternal: z.boolean().optional(),
})
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    prefixIcon: iconFileSchema,
    suffixIcon: iconFileSchema,
    stageIds: z.array(z.string()).optional(),
  });

export const fieldIdSchema = z.object({ id: idString("Field id") });

export const FIELD_SORT_FIELDS = [
  "code",
  "label",
  "labelAr",
  "order",
  "createdAt",
  "updatedAt",
] as const;

export const fieldSortSchema = z
  .array(
    z.object({
      field: z.enum(FIELD_SORT_FIELDS),
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

export const listFieldsInputSchema = paginationQuerySchema.extend({
  filter: z
    .object({
      stepId: z.union([z.string(), filterConditionSchema]).optional(),
      groupId: z.union([z.string(), filterConditionSchema]).optional(),
      code: z.union([z.string(), filterConditionSchema]).optional(),
      label: z.union([z.string(), filterConditionSchema]).optional(),
      type: z.union([fieldTypeSchema, filterConditionSchema]).optional(),
    })
    .optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: fieldSortSchema,
  withoutPagination: z.boolean().optional().default(false),
});

// --- Rule ---

export const createRuleInputSchema = createInsertSchema(formRule, {
  serviceId: idString("Service id"),
  name: z.string().trim().min(1, "Name is required"),
  trigger: ruleTriggerSchema,
  sourceFieldId: z.string().nullish(),
  stepId: z.string().nullish(),
  condition: visibilityConditionSchema.nullish(),
  actions: z.array(ruleActionSchema).default([]),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRuleInputSchema = createUpdateSchema(formRule, {
  id: idString("Rule id"),
  name: z.string().trim().min(1).optional(),
  trigger: ruleTriggerSchema.optional(),
  sourceFieldId: z.string().nullish(),
  stepId: z.string().nullish(),
  condition: visibilityConditionSchema.nullish(),
  actions: z.array(ruleActionSchema).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
}).omit({
  createdAt: true,
  updatedAt: true,
  serviceId: true,
});

export const ruleIdSchema = z.object({ id: idString("Rule id") });

export const RULE_SORT_FIELDS = [
  "name",
  "trigger",
  "order",
  "isActive",
  "createdAt",
  "updatedAt",
] as const;

export const ruleSortSchema = z
  .array(
    z.object({
      field: z.enum(RULE_SORT_FIELDS),
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

export const listRulesInputSchema = paginationQuerySchema.extend({
  filter: z
    .object({
      serviceId: z.union([z.string(), filterConditionSchema]).optional(),
      trigger: z.union([ruleTriggerSchema, filterConditionSchema]).optional(),
      sourceFieldId: z.union([z.string(), filterConditionSchema]).optional(),
      stepId: z.union([z.string(), filterConditionSchema]).optional(),
      isActive: z.union([z.boolean(), filterConditionSchema]).optional(),
    })
    .optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: ruleSortSchema,
  withoutPagination: z.boolean().optional().default(false),
});

// --- Output schemas ---

const stageRefSchema = z.object({
  id: z.string(),
  title: z.string(),
  titleAr: z.string(),
  order: z.number(),
});

const stepBaseOutputSchema = createSelectSchema(formStep).omit({
  createdAt: true,
  updatedAt: true,
});

export const stepOutputSchema = stepBaseOutputSchema.extend({
  stages: z.array(stageRefSchema),
});

const groupBaseOutputSchema = createSelectSchema(formGroup).omit({
  createdAt: true,
  updatedAt: true,
});

export const groupOutputSchema = groupBaseOutputSchema.extend({
  stages: z.array(stageRefSchema),
});

const fieldBaseOutputSchema = createSelectSchema(formField).omit({
  createdAt: true,
  updatedAt: true,
});

export const fieldOutputSchema = fieldBaseOutputSchema.extend({
  stages: z.array(stageRefSchema),
});

const ruleBaseOutputSchema = createSelectSchema(formRule).omit({
  createdAt: true,
  updatedAt: true,
});

export const ruleOutputSchema = ruleBaseOutputSchema;

const stepWithChildrenSchema = stepOutputSchema.extend({
  groups: z.array(
    groupOutputSchema.extend({ fields: z.array(fieldOutputSchema) }),
  ),
  fields: z.array(fieldOutputSchema),
});

export const formByServiceOutputSchema = z.object({
  serviceId: z.string(),
  steps: z.array(stepWithChildrenSchema),
  rules: z.array(ruleOutputSchema),
});

export const stepResponseSchema = z.object({ step: stepOutputSchema });
export const listStepsOutputSchema = paginatedResponseSchema(stepOutputSchema);

export const groupResponseSchema = z.object({ group: groupOutputSchema });
export const listGroupsOutputSchema =
  paginatedResponseSchema(groupOutputSchema);

export const fieldResponseSchema = z.object({ field: fieldOutputSchema });
export const listFieldsOutputSchema =
  paginatedResponseSchema(fieldOutputSchema);

export const ruleResponseSchema = z.object({ rule: ruleOutputSchema });
export const listRulesOutputSchema = paginatedResponseSchema(ruleOutputSchema);
