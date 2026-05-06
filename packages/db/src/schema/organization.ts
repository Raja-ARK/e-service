import {
  CURRENCY,
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  HOUR_FORMAT,
  ITEMS_PER_PAGE,
  LANGUAGE,
  THEME,
  TIME_FORMAT,
  TIMEZONE,
} from "@e-service/shared/utils/constant";
import { pgTable, smallint, text, timestamp } from "drizzle-orm/pg-core";
import { hourFormatEnum, languagesEnum, themeEnum } from "./common";

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default("E Service Digital Platform"),
  nameAr: text("name_ar").notNull().default("منصة الخدمات الرقمية"),
  logo: text("logo"),
  currency: text("currency").notNull().default(CURRENCY),
  timezone: text("timezone").notNull().default(TIMEZONE),
  language: languagesEnum("language").notNull().default(LANGUAGE),
  dateFormat: text("date_format").notNull().default(DATE_FORMAT),
  dateTimeFormat: text("date_time_format").notNull().default(DATE_TIME_FORMAT),
  timeFormat: text("time_format").notNull().default(TIME_FORMAT),
  hourFormat: hourFormatEnum("hour_format").notNull().default(HOUR_FORMAT),
  defaultTheme: themeEnum("theme").notNull().default(THEME),
  itemsPerPage: smallint("items_per_page").notNull().default(ITEMS_PER_PAGE),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
