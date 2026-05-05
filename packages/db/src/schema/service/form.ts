import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { portalTypeEnum } from "../common";
import { service } from "./service";
import { stage } from "./stage";

export const formTypeEnum = pgEnum("form_type", ["step", "group"]);

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
]);

export const form = pgTable("form", {
  id: text("id").primaryKey(),
  serviceId: text("service_id")
    .notNull()
    .unique()
    .references(() => service.id, { onDelete: "cascade" }),
  type: formTypeEnum("type").notNull().default("step"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const formStep = pgTable("form_step", {
  id: text("id").primaryKey(),
  formId: text("form_id")
    .notNull()
    .references(() => form.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  order: integer("order").notNull().default(0),
  hideFor: portalTypeEnum("hide_for"),
  color: text("color"),
  icon: text("icon"),
  type: stepTypeEnum("type").notNull().default("normal"),
  templateType: formTemplateTypeEnum("template_type")
    .notNull()
    .default("normal"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// optional subgroup within a step
export const formGroup = pgTable("form_group", {
  id: text("id").primaryKey(),
  stepId: text("step_id")
    .notNull()
    .references(() => formStep.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  labelAr: text("label_ar").notNull(),
  order: integer("order").notNull().default(0),
  icon: text("icon"),
  templateType: formTemplateTypeEnum("template_type")
    .notNull()
    .default("normal"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// junction: which stages show this step
export const formStepStage = pgTable(
  "form_step_stage",
  {
    stepId: text("step_id")
      .notNull()
      .references(() => formStep.id, { onDelete: "cascade" }),
    stageId: text("stage_id")
      .notNull()
      .references(() => stage.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.stepId, t.stageId] })],
);

// junction: which stages show this group
export const formGroupStage = pgTable(
  "form_group_stage",
  {
    groupId: text("group_id")
      .notNull()
      .references(() => formGroup.id, { onDelete: "cascade" }),
    stageId: text("stage_id")
      .notNull()
      .references(() => stage.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.groupId, t.stageId] })],
);

// field belongs to step directly (stepId set, groupId null)
// OR belongs to a group (groupId set, stepId null)
export const formField = pgTable("form_field", {
  id: text("id").primaryKey(),
  stepId: text("step_id").references(() => formStep.id, {
    onDelete: "cascade",
  }),
  groupId: text("group_id").references(() => formGroup.id, {
    onDelete: "cascade",
  }),
  label: text("label").notNull(),
  labelAr: text("label_ar").notNull(),
  type: fieldTypeEnum("type").notNull(),
  required: boolean("required").notNull().default(false),
  order: integer("order").notNull().default(0),
  // type-specific config: accept, maxSize, placeholder, min, max, etc.
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const formRelations = relations(form, ({ one, many }) => ({
  service: one(service, {
    fields: [form.serviceId],
    references: [service.id],
  }),
  steps: many(formStep),
}));

export const formStepRelations = relations(formStep, ({ one, many }) => ({
  form: one(form, {
    fields: [formStep.formId],
    references: [form.id],
  }),
  groups: many(formGroup),
  fields: many(formField),
  stages: many(formStepStage),
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

export const formFieldRelations = relations(formField, ({ one }) => ({
  step: one(formStep, {
    fields: [formField.stepId],
    references: [formStep.id],
  }),
  group: one(formGroup, {
    fields: [formField.groupId],
    references: [formGroup.id],
  }),
}));
