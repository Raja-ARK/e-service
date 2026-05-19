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
import { user } from "../auth";
import { documentTemplate } from "../document";
import { emailTemplate } from "../email";
import {
  formGroupStage,
  formStepStage,
  type VisibilityCondition,
} from "./form";
import { service } from "./service";

// Bilingual label used wherever text must appear in both EN and AR
export type BilingualValue = {
  en: string; // English value
  ar: string; // Arabic value
};

// Who gets assigned to the request when an action fires
export type ActionAssignment =
  | { type: "applicant" } // re-assign back to the citizen who submitted
  | { type: "internal"; userIds: string[] }; // assign to pre-configured internal user(s) chosen at setup time

// All side-effects applied to the request when an action fires
export type ActionOutcome = {
  requestStatus?: BilingualValue | null; // new request status after action
  paymentStatus?: BilingualValue | null; // new payment status after action (if applicable)
  assignment?: ActionAssignment | null; // who gets assigned; omit = no change to assignee
};

// Condition controlling when a stageAction is visible to the user
export type ActionCondition = {
  statuses?: string[]; // show only when request.status is in this list
  roles?: ("external" | "internal")[]; // show only for these user categories
  operator?: "AND" | "OR" | null; // how to combine statuses + roles (default AND)
};

// Button style applied to the action in the UI
export const stageActionVariantEnum = pgEnum("stage_action_variant", [
  "primary",
  "secondary",
  "warning",
  "warning-outline",
  "outline",
  "ghost",
  "link",
]);

// Action types available to external (citizen) users
export const stageActionTypeExternalEnum = pgEnum(
  "stage_action_type_external",
  ["submit", "payment", "certificate", "intermediate-submission", "withdraw"],
);

// Action types available to internal (staff) users
export const stageActionTypeInternalEnum = pgEnum(
  "stage_action_type_internal",
  [
    "approve",
    "reject",
    "send-back",
    "schedule-inspection",
    "complete-inspection",
  ],
);

// A workflow stage — ordered step in a service request lifecycle
export const stage = pgTable(
  "stage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(), // stage name in English
    titleAr: text("title_ar").notNull(), // stage name in Arabic
    order: smallint("order").notNull().default(0), // display + processing order
    isActive: boolean("is_active").notNull().default(true),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => service.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => user.id),
    updatedBy: text("updated_by").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("stage_service_id_idx").on(table.serviceId),
    index("stage_service_order_idx").on(table.serviceId, table.order),
  ],
);

// An action button available at a specific stage
export const action = pgTable(
  "action",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => stage.id, { onDelete: "cascade" }),
    actionName: text("action_name").notNull(),
    actionNameAr: text("action_name_ar").notNull(),
    // category: categoryEnum("category").notNull(),
    actionVariant: stageActionVariantEnum("action_variant")
      .notNull()
      .default("primary"),
    typeExternal: stageActionTypeExternalEnum("type_external"),
    typeInternal: stageActionTypeInternalEnum("type_internal"),
    order: smallint("order").notNull().default(0),
    icon: text("icon"),
    modalIcon: text("modal_icon"),
    disabled: boolean("disabled").notNull().default(false),
    showCondition: jsonb("show_condition")
      .$type<ActionCondition | null>()
      .default(null), // visibility rule based on request status / user role
    outcome: jsonb("outcome").$type<ActionOutcome | null>().default(null), // default status update applied on normal completion (overridden per skip entry)
    createdBy: text("created_by").references(() => user.id),
    updatedBy: text("updated_by").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("action_stage_id_idx").on(table.stageId)],
);

// Stages to mark complete when this action fires
export const actionCompleteStage = pgTable(
  "action_complete_stage",
  {
    actionId: uuid("action_id")
      .notNull()
      .references(() => action.id, { onDelete: "cascade" }),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => stage.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.actionId, table.stageId] })],
);

// Stages to remove from the request when this action fires
export const actionRemoveStage = pgTable(
  "action_remove_stage",
  {
    actionId: uuid("action_id")
      .notNull()
      .references(() => action.id, { onDelete: "cascade" }),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => stage.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.actionId, table.stageId] })],
);

// Stages to conditionally skip when this action fires
export const actionSkipStage = pgTable(
  "action_skip_stage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actionId: uuid("action_id")
      .notNull()
      .references(() => action.id, { onDelete: "cascade" }),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => stage.id, { onDelete: "cascade" }),
    condition: jsonb("condition")
      .$type<VisibilityCondition | null>()
      .default(null), // only skip when this condition is true
    outcome: jsonb("outcome").$type<ActionOutcome | null>().default(null), // status update applied when this skip path fires (overrides action default)
  },
  (table) => [
    index("action_skip_stage_action_id_idx").on(table.actionId),
    index("action_skip_stage_stage_id_idx").on(table.stageId),
  ],
);

// An email notification sent when an action fires (an action can trigger multiple emails)
export const actionEmail = pgTable(
  "action_email",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actionId: uuid("action_id")
      .notNull()
      .references(() => action.id, { onDelete: "cascade" }),
    emailTemplateId: uuid("email_template_id")
      .notNull()
      .references(() => emailTemplate.id),
  },
  (table) => [index("action_email_action_id_idx").on(table.actionId)],
);

// An attachment sent with an actionEmail — either a document template or a user-uploaded default file
export const actionEmailAttachment = pgTable(
  "action_email_attachment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actionEmailId: uuid("action_email_id")
      .notNull()
      .references(() => actionEmail.id, { onDelete: "cascade" }),
    documentTemplateId: uuid("document_template_id").references(
      () => documentTemplate.id,
    ), // null when attachment is a user-uploaded file
    fileUrl: text("file_url"), // null when attachment is a user-uploaded file
  },
  (table) => [
    index("action_email_attachment_action_email_id_idx").on(
      table.actionEmailId,
    ),
  ],
);

export const stageRelations = relations(stage, ({ many, one }) => ({
  formSteps: many(formStepStage),
  formGroups: many(formGroupStage),
  service: one(service, {
    fields: [stage.serviceId],
    references: [service.id],
  }),
  actions: many(action),
  completeForActions: many(actionCompleteStage),
  removeForActions: many(actionRemoveStage),
  skipForActions: many(actionSkipStage),
}));

export const actionRelations = relations(action, ({ one, many }) => ({
  stage: one(stage, {
    fields: [action.stageId],
    references: [stage.id],
  }),
  completeStages: many(actionCompleteStage),
  removeStages: many(actionRemoveStage),
  skipStages: many(actionSkipStage),
  emails: many(actionEmail),
}));

export const actionCompleteStageRelations = relations(
  actionCompleteStage,
  ({ one }) => ({
    action: one(action, {
      fields: [actionCompleteStage.actionId],
      references: [action.id],
    }),
    stage: one(stage, {
      fields: [actionCompleteStage.stageId],
      references: [stage.id],
    }),
  }),
);

export const actionRemoveStageRelations = relations(
  actionRemoveStage,
  ({ one }) => ({
    action: one(action, {
      fields: [actionRemoveStage.actionId],
      references: [action.id],
    }),
    stage: one(stage, {
      fields: [actionRemoveStage.stageId],
      references: [stage.id],
    }),
  }),
);

export const actionSkipStageRelations = relations(
  actionSkipStage,
  ({ one }) => ({
    action: one(action, {
      fields: [actionSkipStage.actionId],
      references: [action.id],
    }),
    stage: one(stage, {
      fields: [actionSkipStage.stageId],
      references: [stage.id],
    }),
  }),
);

export const actionEmailRelations = relations(actionEmail, ({ one, many }) => ({
  action: one(action, {
    fields: [actionEmail.actionId],
    references: [action.id],
  }),
  emailTemplate: one(emailTemplate, {
    fields: [actionEmail.emailTemplateId],
    references: [emailTemplate.id],
  }),
  attachments: many(actionEmailAttachment),
}));

export const actionEmailAttachmentRelations = relations(
  actionEmailAttachment,
  ({ one }) => ({
    actionEmail: one(actionEmail, {
      fields: [actionEmailAttachment.actionEmailId],
      references: [actionEmail.id],
    }),
    documentTemplate: one(documentTemplate, {
      fields: [actionEmailAttachment.documentTemplateId],
      references: [documentTemplate.id],
    }),
  }),
);
