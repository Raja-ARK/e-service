import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../auth";
import { service } from "./service";

export const prerequisite = pgTable(
  "prerequisite",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    text: text("text").notNull(),
    textAr: text("text_ar").notNull(),
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
  (table) => [index("prerequisite_service_id_idx").on(table.serviceId)],
);

export const prerequisiteRelations = relations(prerequisite, ({ one }) => ({
  service: one(service, {
    fields: [prerequisite.serviceId],
    references: [service.id],
  }),
}));
