import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { service } from "./service";

export const department = pgTable("department", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").unique().notNull(),
  nameAr: text("name_ar").unique().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  descriptionAr: text("description_ar"),
  logo: text("logo"),
  createdBy: text("created_by").references(() => user.id),
  updatedBy: text("updated_by").references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const departmentRelations = relations(department, ({ many }) => ({
  services: many(service),
}));
