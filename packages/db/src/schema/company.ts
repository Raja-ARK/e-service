import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const company = pgTable("company", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  status: text("status"),
  statusAr: text("status_ar"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Junction: many users can belong to many companies
export const companyUser = pgTable("company_user", {
  companyId: uuid("company_id")
    .notNull()
    .references(() => company.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const companyRelations = relations(company, ({ many }) => ({
  users: many(companyUser),
}));

export const companyUserRelations = relations(companyUser, ({ one }) => ({
  company: one(company, {
    fields: [companyUser.companyId],
    references: [company.id],
  }),
  user: one(user, {
    fields: [companyUser.userId],
    references: [user.id],
  }),
}));
