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
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().default(587),
    SMTP_SECURE: z.coerce.boolean().default(false),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    SMTP_FROM: z.string().min(1),
    SMTP_CC_MAILS: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    // Storage (files-sdk/fs) — required only when using @e-service/storage
    STORAGE_ROOT: z.string().optional(),
    STORAGE_PUBLIC_URL: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
