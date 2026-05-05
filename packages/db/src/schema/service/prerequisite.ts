import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { service } from "./service";

export const prerequisite = pgTable("prerequisite", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  textAr: text("text_ar").notNull(),
  serviceId: text("service_id")
    .notNull()
    .references(() => service.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const prerequisiteRelations = relations(prerequisite, ({ one }) => ({
  service: one(service, {
    fields: [prerequisite.serviceId],
    references: [service.id],
  }),
}));
