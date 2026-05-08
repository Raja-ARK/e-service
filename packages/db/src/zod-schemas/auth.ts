import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { session, user } from "../schema/auth";

export const userSchema = createSelectSchema(user);
export const sessionSchema = createSelectSchema(session);

export type User = z.infer<typeof userSchema>;
