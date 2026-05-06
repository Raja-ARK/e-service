import { relations } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const menuTypeEnum = pgEnum("menu_type", [
  "internal",
  "external",
  "admin",
]);

export const menu = pgTable("menu", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id").references(
    ((): PgColumn => menu.id) as () => PgColumn,
    { onDelete: "cascade" },
  ),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  icon: text("icon"),
  link: text("link"),
  isGroup: boolean("is_group").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  disabled: boolean("disabled").default(false).notNull(),
  order: integer("order").default(0).notNull(),
  type: menuTypeEnum("type").default("internal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const menuRelations = relations(menu, ({ one, many }) => ({
  parent: one(menu, {
    fields: [menu.parentId],
    references: [menu.id],
    relationName: "menuChildren",
  }),
  children: many(menu, { relationName: "menuChildren" }),
}));
