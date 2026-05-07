import dotenv from "dotenv";
import { resolve } from "path";

// Load .env from apps/server — fallback for tools (seed, drizzle-kit) run outside that app
dotenv.config({ path: resolve(import.meta.dir, "../../../apps/server/.env") });
dotenv.config(); // also try CWD/.env so apps/server works normally

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    INTERNAL_URL: z.url(),
    EXTERNAL_URL: z.url(),
    ADMIN_URL: z.url(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
