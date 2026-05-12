import { pgEnum } from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", ["professional", "corporate"]);

export const portalTypeEnum = pgEnum("portal_type", ["external", "internal"]);

export const languagesEnum = pgEnum("languages", ["english", "arabic"]);

export const hourFormatEnum = pgEnum("hour_format", ["12", "24"]);

export const themeEnum = pgEnum("theme", ["light", "dark"]);
