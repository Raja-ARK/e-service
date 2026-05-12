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
import type { InferInsertModel } from "drizzle-orm";
import { db } from "..";
import { organization } from "../schema";

const organizationData: InferInsertModel<typeof organization> = {
  name: "E Service Digital Platform",
  nameAr: "منصة الخدمات الرقمية",
  logo: null,
  currency: CURRENCY,
  timezone: TIMEZONE,
  language: LANGUAGE,
  dateFormat: DATE_FORMAT,
  dateTimeFormat: DATE_TIME_FORMAT,
  timeFormat: TIME_FORMAT,
  hourFormat: HOUR_FORMAT,
  defaultTheme: THEME,
  itemsPerPage: ITEMS_PER_PAGE,
};

export const seedOrganization = async () => {
  console.log("Seeding organization...");

  await db.insert(organization).values(organizationData);

  console.log("Organization seeded successfully!");
};
