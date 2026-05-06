import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { categoryEnum } from "../common";
import {
  formGroupStage,
  formStepStage,
  type VisibilityCondition,
} from "./form";

export type SkipStage = {
  stageId: string;
  condition?: VisibilityCondition;
};

export const stageActionVariantEnum = pgEnum("stage_action_variant", [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
]);

export const stageActionTypeExternalEnum = pgEnum(
  "stage_action_type_external",
  ["submit", "payment", "certificate", "intermediate-submission"],
);

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

export const stage = pgTable("stage", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  order: smallint("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stageAction = pgTable("stage_action", {
  id: text("id").primaryKey(),
  stageId: text("stage_id")
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
  completeStageIds: text("complete_stage_ids").array().notNull().default([]),
  removeStageIds: text("remove_stage_ids").array().notNull().default([]),
  skipStages: jsonb("skip_stages").$type<SkipStage[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stageRelations = relations(stage, ({ many }) => ({
  formSteps: many(formStepStage),
  formGroups: many(formGroupStage),
}));
