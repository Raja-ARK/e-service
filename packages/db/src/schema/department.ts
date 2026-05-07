import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { service } from "./service";

export const department = pgTable("department", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  descriptionAr: text("description_ar"),
  logo: text("logo"),
  createdByUserId: text("created_by_user_id").references(() => user.id),
  updatedByUserId: text("updated_by_user_id").references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const departmentRelations = relations(department, ({ many }) => ({
  services: many(service),
}));
