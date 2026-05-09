import { resolve } from "node:path";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

// Load .env from apps/server — fallback for tools (seed, drizzle-kit) run outside that app
dotenv.config({ path: resolve(import.meta.dir, "../../../apps/server/.env") });
dotenv.config(); // also try CWD/.env so apps/server works normally

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    INTERNAL_URL: z.url(),
    EXTERNAL_URL: z.url(),
    ADMIN_URL: z.url(),
    RESEND_API_KEY: z.string().min(1),
    RESEND_FROM_EMAIL: z.email(),
    RESEND_TEST_EMAIL: z.email().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
