import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { formGroupStage, formStepStage } from "./form";

export const stage = pgTable("stage", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stageRelations = relations(stage, ({ many }) => ({
  formSteps: many(formStepStage),
  formGroups: many(formGroupStage),
}));
