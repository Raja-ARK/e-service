import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { categoryEnum } from "./common";

export const announcement = pgTable("announcement", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  attachment: text("attachment"),
  issueDate: timestamp("issue_date", { withTimezone: true }).notNull(),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  category: categoryEnum("category")
    .array()
    .notNull()
    .default(["corporate", "professional"]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
