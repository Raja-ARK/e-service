import { env } from "@e-service/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export const createDb = () => {
  return drizzle(env.DATABASE_URL, { schema });
};

export const db = createDb();
