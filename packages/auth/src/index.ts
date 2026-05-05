import { createDb } from "@e-service/db";
import * as schema from "@e-service/db/schema/auth";
import { env } from "@e-service/env/server";
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
    plugins: [],
  });
};

export const auth = createAuth();
