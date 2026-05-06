import { createDb } from "@e-service/db";
import * as schema from "@e-service/db/schema/auth";
import { env } from "@e-service/env/server";
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
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const createAuth = () => {
  const db = createDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    trustedOrigins: [env.EXTERNAL_URL, env.INTERNAL_URL, env.ADMIN_URL],
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        accessType: "offline",
        prompt: "select_account consent",
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "lax",
        secure: false,
        httpOnly: true,
      },
    },
    user: {
      additionalFields: {
        role: {
          type: ["external", "internal", "admin"],
          defaultValue: "external",
          required: true,
        },
        nameAr: {
          type: "string",
          defaultValue: null,
          required: false,
        },
        gender: {
          type: ["male", "female", "other"],
          defaultValue: null,
          required: false,
        },
        mobile: {
          type: "string",
          defaultValue: null,
          required: false,
        },
        nationality: {
          type: "string",
          defaultValue: null,
          required: false,
        },
        emirateId: {
          type: "string",
          defaultValue: null,
          required: false,
        },
        dob: {
          type: "date",
          defaultValue: null,
          required: false,
        },
        favoriteServiceIds: {
          type: "string[]",
          defaultValue: [],
          required: false,
        },
        language: {
          type: ["english", "arabic"],
          defaultValue: LANGUAGE,
          required: false,
        },
        dateFormat: {
          type: "string",
          defaultValue: DATE_FORMAT,
        },
        dateTimeFormat: {
          type: "string",
          defaultValue: DATE_TIME_FORMAT,
        },
        itemsPerPage: {
          type: "number",
          defaultValue: ITEMS_PER_PAGE,
        },
        timeFormat: {
          type: "string",
          defaultValue: TIME_FORMAT,
        },
        hourFormat: {
          type: ["12", "24"],
          defaultValue: HOUR_FORMAT,
        },
        defaultTheme: {
          type: ["light", "dark"],
          defaultValue: THEME,
        },
        timezone: {
          type: "string",
          defaultValue: TIMEZONE,
        },
        currency: {
          type: "string",
          defaultValue: CURRENCY,
        },
      },
    },
    plugins: [],
  });
};

export const auth = createAuth();
