import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "../auth";
import { emailTemplate } from "../email";
import { categoryEnum } from "../shared";
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
  requestStatus?: BilingualValue; // new request status after action
  paymentStatus?: BilingualValue; // new payment status after action (if applicable)
  assignment?: ActionAssignment; // who gets assigned; omit = no change to assignee
};

// Condition controlling when a stageAction is visible to the user
export type ActionCondition = {
  statuses?: string[]; // show only when request.status is in this list
  roles?: ("external" | "internal")[]; // show only for these user categories
  operator?: "AND" | "OR"; // how to combine statuses + roles (default AND)
};

// A stage to skip when the action fires, with an optional trigger condition and outcome override
export type SkipStage = {
  stageId: string; // target stage to skip
  condition?: VisibilityCondition; // only skip when this condition is true
  outcome?: ActionOutcome; // status update to apply when THIS skip path fires (overrides action default outcome)
};

// Button style applied to the action in the UI
export const stageActionVariantEnum = pgEnum("stage_action_variant", [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
]);

// Action types available to external (citizen) users
export const stageActionTypeExternalEnum = pgEnum(
  "stage_action_type_external",
  ["submit", "payment", "certificate", "intermediate-submission"],
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
    createdByUserId: text("created_by_user_id").references(() => user.id),
    updatedByUserId: text("updated_by_user_id").references(() => user.id),
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
    category: categoryEnum("category").notNull(),
    actionVariant: stageActionVariantEnum("action_variant")
      .notNull()
      .default("primary"),
    typeExternal: stageActionTypeExternalEnum("type_external"),
    typeInternal: stageActionTypeInternalEnum("type_internal"),
    icon: text("icon"),
    modalIcon: text("modal_icon"),
    disabled: boolean("disabled").notNull().default(false),
    showCondition: jsonb("show_condition").$type<ActionCondition>(), // visibility rule based on request status / user role
    completeStageIds: text("complete_stage_ids").array().notNull().default([]), // stages to mark complete when action fires
    removeStageIds: text("remove_stage_ids").array().notNull().default([]), // stages to remove from request when action fires
    skipStages: jsonb("skip_stages").$type<SkipStage[]>().notNull().default([]), // conditional stage skips; each entry carries its own outcome override
    outcome: jsonb("outcome").$type<ActionOutcome>(), // default status update applied on normal completion (overridden per skip entry)
    emailTemplateId: uuid("email_template_id").references(
      () => emailTemplate.id,
    ), // notification email sent to assignee/applicant when this action fires
    createdByUserId: text("created_by_user_id").references(() => user.id),
    updatedByUserId: text("updated_by_user_id").references(() => user.id),
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

export const stageRelations = relations(stage, ({ many, one }) => ({
  formSteps: many(formStepStage),
  formGroups: many(formGroupStage),
  service: one(service, {
    fields: [stage.serviceId],
    references: [service.id],
  }),
}));
