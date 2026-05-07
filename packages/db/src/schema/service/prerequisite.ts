import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
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
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
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
