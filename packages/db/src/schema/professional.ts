import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const professional = pgTable(
  "professional",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    status: text("status"),
    statusAr: text("status_ar"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("professional_user_id_idx").on(table.userId)],
);

export const professionalRelations = relations(professional, ({ one }) => ({
  user: one(user, {
    fields: [professional.userId],
    references: [user.id],
  }),
}));
