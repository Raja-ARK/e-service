import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { portalTypeEnum } from "../shared";
import { service } from "./service";
import { stage } from "./stage";

export type FieldRule = {
  fieldId: string;
  operator:
    | "eq"
    | "neq"
    | "in"
    | "nin"
    | "gt"
    | "lt"
    | "empty"
    | "not_empty"
    | "contains"
    | "not_contains"
    | "starts_with"
    | "ends_with";
  value?: string | string[] | number | boolean | null;
};

export type VisibilityCondition =
  | { logic: "and" | "or"; rules: FieldRule[] }
  | FieldRule;

export type DateTimeUnit =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

export type ValueExpression =
  // primitives
  | { type: "static"; value: string | number | boolean | null }
  | { type: "field"; fieldId: string }
  | { type: "now" }
  | { type: "null" }
  // date & time arithmetic
  | {
      type: "date_add";
      source: ValueExpression;
      amount: ValueExpression;
      unit: DateTimeUnit;
    }
  | {
      type: "date_sub";
      source: ValueExpression;
      amount: ValueExpression;
      unit: DateTimeUnit;
    }
  | {
      type: "date_diff";
      from: ValueExpression;
      to: ValueExpression;
      unit: DateTimeUnit;
    }
  // math
  | {
      type: "add" | "subtract" | "multiply" | "divide" | "mod";
      left: ValueExpression;
      right: ValueExpression;
    }
  | { type: "abs" | "ceil" | "floor" | "round"; operand: ValueExpression }
  // string
  | { type: "concat"; parts: ValueExpression[]; separator?: string }
  | { type: "upper" | "lower" | "trim"; operand: ValueExpression }
  | { type: "slice"; operand: ValueExpression; start: number; end?: number }
  // collection
  | { type: "array"; items: ValueExpression[] }
  | { type: "object"; properties: Record<string, ValueExpression> }
  // logical — produce boolean value
  | { type: "and" | "or"; operands: ValueExpression[] }
  | { type: "not"; operand: ValueExpression }
  // coalesce — first non-null
  | { type: "coalesce"; operands: ValueExpression[] }
  // conditional
  | {
      type: "if";
      condition: VisibilityCondition;
      then: ValueExpression;
      else: ValueExpression;
    }
  // switch
  | {
      type: "switch";
      fieldId: string;
      cases: { match: unknown; value: ValueExpression }[];
      default: ValueExpression;
    };

export type RuleAction =
  | { type: "set_value"; fieldId: string; value: ValueExpression }
  | { type: "clear"; fieldId: string }
  | { type: "show" | "hide"; fieldId: string }
  | { type: "enable" | "disable"; fieldId: string }
  | { type: "set_required" | "set_optional"; fieldId: string }
  | { type: "validate"; fieldId: string; message: string; messageAr: string };

export type FieldDefaultValue =
  | string
  | number
  | boolean
  | [string, string]
  | string[]
  | File
  | File[]
  | number[];

export type FieldConfig = {
  required: boolean | null;
  disabled: boolean | null;
  minLength: number | null;
  maxLength: number | null;
  min: number | null;
  max: number | null;
  defaultValue: FieldDefaultValue | null;
  fieldWidth: "100%" | "50%" | "33.33%" | "66.66%";
  fieldAlignment: "left" | "top";
  description: string | null;
  descriptionAr: string | null;
  prefixIcon: string | null;
  suffixIcon: string | null;
  maxFileSize: number;
  allowedFileTypes: string[];
  maxFileCount: number;
  pattern: string | null;
  patternMessage: string | null;
  patternMessageAr: string | null;
  multiple: boolean | null;
};

export const formTypeEnum = pgEnum("form_type", ["step", "group"]);

export const ruleTriggerEnum = pgEnum("rule_trigger", [
  "on_change",
  "on_next",
  "on_submit",
]);

export const stepTypeEnum = pgEnum("step_type", ["normal", "tab"]);

export const formTemplateTypeEnum = pgEnum("form_template_type", [
  "normal",
  "table",
  "multiple",
  "list",
]);

export const fieldTypeEnum = pgEnum("field_type", [
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
  "tag-input",
]);

export const formStep = pgTable("form_step", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => service.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  order: smallint("order").notNull().default(0),
  hideFor: portalTypeEnum("hide_for"),
  color: text("color"),
  icon: text("icon"),
  type: formTypeEnum("type").notNull().default("step"),
  stepType: stepTypeEnum("step_type").notNull().default("normal"),
  templateType: formTemplateTypeEnum("template_type")
    .notNull()
    .default("normal"),
  visibilityCondition: jsonb("visibility_condition")
    .$type<VisibilityCondition | null>()
    .default(null),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// optional subgroup within a step
export const formGroup = pgTable("form_group", {
  id: uuid("id").defaultRandom().primaryKey(),
  stepId: uuid("step_id")
    .notNull()
    .references(() => formStep.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  labelAr: text("label_ar").notNull(),
  order: smallint("order").notNull().default(0),
  hideFor: portalTypeEnum("hide_for"),
  icon: text("icon"),
  templateType: formTemplateTypeEnum("template_type")
    .notNull()
    .default("normal"),
  visibilityCondition: jsonb(
    "visibility_condition",
  ).$type<VisibilityCondition>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// junction: which stages show this step
export const formStepStage = pgTable(
  "form_step_stage",
  {
    stepId: uuid("step_id")
      .notNull()
      .references(() => formStep.id, { onDelete: "cascade" }),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => stage.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.stepId, t.stageId] })],
);

// junction: which stages show this group
export const formGroupStage = pgTable(
  "form_group_stage",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => formGroup.id, { onDelete: "cascade" }),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => stage.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.groupId, t.stageId] })],
);

// junction: which stages show this field
export const formFieldStage = pgTable(
  "form_field_stage",
  {
    fieldId: uuid("field_id")
      .notNull()
      .references(() => formField.id, { onDelete: "cascade" }),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => stage.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.fieldId, t.stageId] })],
);

// field belongs to step directly (stepId set, groupId null)
// OR belongs to a group (groupId set, stepId null)
export const formField = pgTable(
  "form_field",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(),
    stepId: uuid("step_id").references(() => formStep.id, {
      onDelete: "cascade",
    }),
    groupId: uuid("group_id").references(() => formGroup.id, {
      onDelete: "cascade",
    }),
    label: text("label").notNull(),
    labelAr: text("label_ar").notNull(),
    placeholder: text("placeholder"),
    placeholderAr: text("placeholder_ar"),
    helperText: text("helper_text"),
    helperTextAr: text("helper_text_ar"),
    type: fieldTypeEnum("type").notNull(),
    order: smallint("order").notNull().default(0),
    visibilityCondition: jsonb(
      "visibility_condition",
    ).$type<VisibilityCondition>(),
    hideFor: portalTypeEnum("hide_for"),
    // type-specific config: accept, maxSize, placeholder, min, max, etc.
    config: jsonb("config")
      .$type<FieldConfig>()
      .default({
        required: false,
        disabled: false,
        minLength: null,
        maxLength: null,
        min: null,
        max: null,
        defaultValue: null,
        allowedFileTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ],
        maxFileSize: 1024 * 1024 * 10, // 10MB
        maxFileCount: 1,
        fieldWidth: "100%",
        fieldAlignment: "left",
        description: null,
        descriptionAr: null,
        prefixIcon: null,
        suffixIcon: null,
        pattern: null,
        patternMessage: null,
        patternMessageAr: null,
        multiple: null,
      }),
    canEditInInternal: boolean("can_edit_in_internal").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("form_field_step_id_idx").on(table.stepId),
    index("form_field_group_id_idx").on(table.groupId),
  ],
);

export const formRule = pgTable(
  "form_rule",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => service.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    trigger: ruleTriggerEnum("trigger").notNull(),
    // set when trigger = on_change: which field fires this rule
    sourceFieldId: uuid("source_field_id").references(() => formField.id, {
      onDelete: "cascade",
    }),
    // set when trigger = on_next: scopes rule to a specific step
    stepId: uuid("step_id").references(() => formStep.id, {
      onDelete: "cascade",
    }),
    // null condition = always run when triggered
    condition: jsonb("condition")
      .$type<VisibilityCondition | null>()
      .default(null),
    actions: jsonb("actions").$type<RuleAction[]>().notNull().default([]),
    order: smallint("order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("form_rule_service_id_idx").on(table.serviceId),
    index("form_rule_service_order_idx").on(table.serviceId, table.order),
  ],
);

export const formStepRelations = relations(formStep, ({ one, many }) => ({
  service: one(service, {
    fields: [formStep.serviceId],
    references: [service.id],
  }),
  groups: many(formGroup),
  fields: many(formField),
  stages: many(formStepStage),
  rules: many(formRule),
}));

export const formGroupRelations = relations(formGroup, ({ one, many }) => ({
  step: one(formStep, {
    fields: [formGroup.stepId],
    references: [formStep.id],
  }),
  fields: many(formField),
  stages: many(formGroupStage),
}));

export const formStepStageRelations = relations(formStepStage, ({ one }) => ({
  step: one(formStep, {
    fields: [formStepStage.stepId],
    references: [formStep.id],
  }),
  stage: one(stage, {
    fields: [formStepStage.stageId],
    references: [stage.id],
  }),
}));

export const formGroupStageRelations = relations(formGroupStage, ({ one }) => ({
  group: one(formGroup, {
    fields: [formGroupStage.groupId],
    references: [formGroup.id],
  }),
  stage: one(stage, {
    fields: [formGroupStage.stageId],
    references: [stage.id],
  }),
}));

export const formFieldRelations = relations(formField, ({ one, many }) => ({
  step: one(formStep, {
    fields: [formField.stepId],
    references: [formStep.id],
  }),
  group: one(formGroup, {
    fields: [formField.groupId],
    references: [formGroup.id],
  }),
  stages: many(formFieldStage),
  triggeredRules: many(formRule),
}));

export const formFieldStageRelations = relations(formFieldStage, ({ one }) => ({
  field: one(formField, {
    fields: [formFieldStage.fieldId],
    references: [formField.id],
  }),
  stage: one(stage, {
    fields: [formFieldStage.stageId],
    references: [stage.id],
  }),
}));

export const formRuleRelations = relations(formRule, ({ one }) => ({
  service: one(service, {
    fields: [formRule.serviceId],
    references: [service.id],
  }),
  sourceField: one(formField, {
    fields: [formRule.sourceFieldId],
    references: [formField.id],
  }),
  step: one(formStep, {
    fields: [formRule.stepId],
    references: [formStep.id],
  }),
}));
