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
import { createAccessControl } from "better-auth/plugins/access";
import { admin } from "better-auth/plugins/admin";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import { emailOTP } from "better-auth/plugins/email-otp";
import { sendAuthEmail } from "./email";

const statement = {
  ...defaultStatements,
} as const;

const ac = createAccessControl(statement);

const adminRole = ac.newRole({
  ...adminAc.statements,
});

const internalRole = ac.newRole({
  user: ["list", "get"],
});

const externalRole = ac.newRole({
  user: ["get"],
});

export const createAuth = () => {
  const db = createDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 16,
    },
    trustedOrigins: [env.EXTERNAL_URL, env.INTERNAL_URL, env.ADMIN_URL],
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
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    plugins: [
      admin({
        ac,
        roles: {
          admin: adminRole,
          internal: internalRole,
          external: externalRole,
        },
        defaultRole: "external",
      }),
      emailOTP({
        otpLength: 6,
        expiresIn: 60 * 10,
        async sendVerificationOTP({ email, otp, type }, ctx) {
          if (type === "change-email") return;

          await sendAuthEmail({
            email,
            otp,
            type:
              ctx?.path === "/sign-up/email"
                ? "sign-up"
                : type === "sign-in"
                  ? "email-verification"
                  : type,
          });
        },
        sendVerificationOnSignUp: true,
      }),
    ],
  });
};

export const auth = createAuth();
