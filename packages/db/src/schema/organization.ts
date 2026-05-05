import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default("E Service Digital Platform"),
  nameAr: text("name_ar").notNull().default("منصة الخدمات الرقمية"),
  logo: text("logo"),
  currency: text("currency").notNull().default("USD"),
  timezone: text("timezone").notNull().default("UTC"),
  language: text("language").notNull().default("en"),
  dateFormat: text("date_format").notNull().default("DD MMM YYYY"),
  timeFormat: text("time_format").notNull().default("hh:mm a"),
  decimalSeparator: text("decimal_separator").notNull().default("."),
  thousandSeparator: text("thousand_separator").notNull().default(","),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
