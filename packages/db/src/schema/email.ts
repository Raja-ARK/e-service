import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const emailTemplateTypeEnum = pgEnum("email_template_type", [
  "sign-up",
  "service",
  "forget-password",
  "email-verification",
]);

export const emailTemplate = pgTable(
  "email_template",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    subject: text("subject").notNull(),
    html: text("html").notNull(),
    type: emailTemplateTypeEnum("type").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("email_template_type_idx").on(table.type)],
);
