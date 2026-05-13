import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle/zod";
import {
  form,
  formField,
  formGroup,
  formRule,
  formStep,
} from "@e-service/db/schema/service/form";
import { z } from "zod";
import { visibilityConditionSchema } from "./action";

const portalTypeSchema = z.enum(["external", "internal"]);

export const fieldConfigSchema = z
  .object({
    required: z.boolean().nullable().default(false),
    disabled: z.boolean().nullable().default(false),
    minLength: z.number().int().nullable().default(null),
    maxLength: z.number().int().nullable().default(null),
    min: z.number().nullable().default(null),
    max: z.number().nullable().default(null),
    defaultValue: z.unknown().default(null),
    fieldWidth: z
      .enum(["full", "half", "one-third", "two-thirds"])
      .default("full"),
    fieldAlignment: z.enum(["left", "top"]).default("left"),
    description: z.string().nullable().default(null),
    descriptionAr: z.string().nullable().default(null),
    prefixIcon: z.string().nullable().default(null),
    suffixIcon: z.string().nullable().default(null),
    maxFileSize: z.number().int().default(10485760),
    allowedFileTypes: z.array(z.string()).default([]),
    maxFileCount: z.number().int().default(1),
    pattern: z.string().nullable().default(null),
    patternMessage: z.string().nullable().default(null),
    patternMessageAr: z.string().nullable().default(null),
    multiple: z.boolean().nullable().default(null),
  })
  .nullable()
  .optional();

// ValueExpression is deeply recursive — store as opaque JSON
const valueExpressionSchema: z.ZodType = z.lazy(() => z.unknown());

export const ruleActionSchema = z.discriminatedUnion("type", [
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
]);

// ─── Form schemas ─────────────────────────────────────────────────────────────

export const createFormInputSchema = createInsertSchema(form, {
  serviceId: z.string().trim().nonempty("Service id is required"),
  type: z.enum(["step", "group"]).default("step"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateFormInputSchema = createUpdateSchema(form, {
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Form id is required" };
      },
    })
    .trim()
    .nonempty("Form id is required"),
  type: z.enum(["step", "group"]).optional(),
}).omit({ createdAt: true, updatedAt: true, serviceId: true });

export const formIdSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Form id is required" };
      },
    })
    .trim()
    .nonempty("Form id is required"),
});

export const getFormByServiceIdSchema = z.object({
  serviceId: z.string().trim().nonempty("Service id is required"),
});

const formOutputSchema = createSelectSchema(form);
export const formResponseSchema = z.object({ form: formOutputSchema });

// ─── FormStep schemas ─────────────────────────────────────────────────────────

export const createFormStepInputSchema = createInsertSchema(formStep, {
  formId: z.string().trim().nonempty("Form id is required"),
  code: z.string().trim().nonempty("Code is required"),
  title: z.string().trim().min(2).max(250),
  titleAr: z.string().trim().min(2).max(250),
  order: z.number().int().min(0).default(0),
  hideFor: portalTypeSchema.optional().nullish(),
  type: z.enum(["normal", "tab"]).default("normal"),
  templateType: z
    .enum(["normal", "table", "multiple", "list"])
    .default("normal"),
  visibilityCondition: visibilityConditionSchema.optional().nullish(),
})
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({ stageIds: z.array(z.string()).optional().default([]) });

export const updateFormStepInputSchema = createUpdateSchema(formStep, {
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Step id is required" };
      },
    })
    .trim()
    .nonempty("Step id is required"),
  code: z.string().trim().nonempty("Code is required").optional(),
  title: z.string().trim().min(2).max(250).optional(),
  titleAr: z.string().trim().min(2).max(250).optional(),
  order: z.number().int().min(0).optional(),
  hideFor: portalTypeSchema.optional().nullish(),
  type: z.enum(["normal", "tab"]).optional(),
  templateType: z.enum(["normal", "table", "multiple", "list"]).optional(),
  visibilityCondition: visibilityConditionSchema.optional().nullish(),
})
  .omit({ createdAt: true, updatedAt: true, formId: true })
  .extend({ stageIds: z.array(z.string()).optional() });

export const formStepIdSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Step id is required" };
      },
    })
    .trim()
    .nonempty("Step id is required"),
});

const formStepOutputSchema = createSelectSchema(formStep);
export const formStepResponseSchema = z.object({ step: formStepOutputSchema });

// ─── FormGroup schemas ────────────────────────────────────────────────────────

export const createFormGroupInputSchema = createInsertSchema(formGroup, {
  stepId: z.string().trim().nonempty("Step id is required"),
  code: z.string().trim().nonempty("Code is required"),
  label: z.string().trim().min(2).max(250),
  labelAr: z.string().trim().min(2).max(250),
  order: z.number().int().min(0).default(0),
  hideFor: portalTypeSchema.optional().nullish(),
  templateType: z
    .enum(["normal", "table", "multiple", "list"])
    .default("normal"),
  visibilityCondition: visibilityConditionSchema.optional().nullish(),
})
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({ stageIds: z.array(z.string()).optional().default([]) });

export const updateFormGroupInputSchema = createUpdateSchema(formGroup, {
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Group id is required" };
      },
    })
    .trim()
    .nonempty("Group id is required"),
  code: z.string().trim().nonempty("Code is required").optional(),
  label: z.string().trim().min(2).max(250).optional(),
  labelAr: z.string().trim().min(2).max(250).optional(),
  order: z.number().int().min(0).optional(),
  hideFor: portalTypeSchema.optional().nullish(),
  templateType: z.enum(["normal", "table", "multiple", "list"]).optional(),
  visibilityCondition: visibilityConditionSchema.optional().nullish(),
})
  .omit({ createdAt: true, updatedAt: true, stepId: true })
  .extend({ stageIds: z.array(z.string()).optional() });

export const formGroupIdSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Group id is required" };
      },
    })
    .trim()
    .nonempty("Group id is required"),
});

const formGroupOutputSchema = createSelectSchema(formGroup);
export const formGroupResponseSchema = z.object({
  group: formGroupOutputSchema,
});

// ─── FormField schemas ────────────────────────────────────────────────────────

export const createFormFieldInputSchema = createInsertSchema(formField, {
  code: z.string().trim().nonempty("Code is required"),
  stepId: z.string().trim().optional().nullish(),
  groupId: z.string().trim().optional().nullish(),
  label: z.string().trim().min(2).max(250),
  labelAr: z.string().trim().min(2).max(250),
  placeholder: z.string().trim().optional().nullish(),
  placeholderAr: z.string().trim().optional().nullish(),
  helperText: z.string().trim().optional().nullish(),
  helperTextAr: z.string().trim().optional().nullish(),
  type: z.enum([
    "text",
    "number",
    "date",
    "textarea",
    "select",
    "radio",
    "checkbox",
    "file",
    "time",
    "switch",
    "slider",
    "rating",
    "avatar",
  ]),
  order: z.number().int().min(0).default(0),
  visibilityCondition: visibilityConditionSchema.optional().nullish(),
  hideFor: portalTypeSchema.optional().nullish(),
  config: fieldConfigSchema,
})
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({ stageIds: z.array(z.string()).optional().default([]) })
  .check(({ issues, value }) => {
    if (!value.stepId && !value.groupId) {
      issues.push({
        code: "custom",
        message: "Field must belong to a step or a group",
        input: value,
      });
    }
  });

export const updateFormFieldInputSchema = createUpdateSchema(formField, {
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Field id is required" };
      },
    })
    .trim()
    .nonempty("Field id is required"),
  code: z.string().trim().nonempty("Code is required").optional(),
  label: z.string().trim().min(2).max(250).optional(),
  labelAr: z.string().trim().min(2).max(250).optional(),
  placeholder: z.string().trim().optional().nullish(),
  placeholderAr: z.string().trim().optional().nullish(),
  helperText: z.string().trim().optional().nullish(),
  helperTextAr: z.string().trim().optional().nullish(),
  type: z
    .enum([
      "text",
      "number",
      "date",
      "textarea",
      "select",
      "radio",
      "checkbox",
      "file",
      "time",
      "switch",
      "slider",
      "rating",
      "avatar",
    ])
    .optional(),
  order: z.number().int().min(0).optional(),
  visibilityCondition: visibilityConditionSchema.optional().nullish(),
  hideFor: portalTypeSchema.optional().nullish(),
  config: fieldConfigSchema,
})
  .omit({ createdAt: true, updatedAt: true, stepId: true, groupId: true })
  .extend({ stageIds: z.array(z.string()).optional() });

export const formFieldIdSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Field id is required" };
      },
    })
    .trim()
    .nonempty("Field id is required"),
});

const formFieldOutputSchema = createSelectSchema(formField);
export const formFieldResponseSchema = z.object({
  field: formFieldOutputSchema,
});

// ─── FormRule schemas ─────────────────────────────────────────────────────────

export const createFormRuleInputSchema = createInsertSchema(formRule, {
  formId: z.string().trim().nonempty("Form id is required"),
  name: z.string().trim().min(2).max(250),
  trigger: z.enum(["on_change", "on_next", "on_submit"]),
  sourceFieldId: z.string().trim().optional().nullish(),
  stepId: z.string().trim().optional().nullish(),
  condition: visibilityConditionSchema.optional().nullish(),
  actions: z.array(ruleActionSchema).default([]),
  order: z.number().int().min(0).default(0),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateFormRuleInputSchema = createUpdateSchema(formRule, {
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Rule id is required" };
      },
    })
    .trim()
    .nonempty("Rule id is required"),
  name: z.string().trim().min(2).max(250).optional(),
  trigger: z.enum(["on_change", "on_next", "on_submit"]).optional(),
  sourceFieldId: z.string().trim().optional().nullish(),
  stepId: z.string().trim().optional().nullish(),
  condition: visibilityConditionSchema.optional().nullish(),
  actions: z.array(ruleActionSchema).optional(),
  order: z.number().int().min(0).optional(),
}).omit({ createdAt: true, updatedAt: true, formId: true });

export const formRuleIdSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type") return { message: "Rule id is required" };
      },
    })
    .trim()
    .nonempty("Rule id is required"),
});

const formRuleOutputSchema = createSelectSchema(formRule);
export const formRuleResponseSchema = z.object({ rule: formRuleOutputSchema });
