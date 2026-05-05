import { pgEnum } from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", ["professional", "corporate"]);

export const portalTypeEnum = pgEnum("portal_type", ["external", "internal"]);
