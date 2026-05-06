import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { categoryEnum } from "../common";
import { department } from "../department";
import { catalog } from "./catalog";
import { prerequisite } from "./prerequisite";

export type CompletionStatus =
  | {
      status: string;
      statusAr: string;
    }
  | {
      eligileStatus: string;
      status: string;
      statusAr: string;
    }[]
  | null;

export type CompletionScriptType = {
  type: (typeof categoryEnum.enumValues)[number];
  script: string;
};

export const eligibleByEnum = pgEnum("eligible_by", ["always", "status-wise"]);

export const service = pgTable("service", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  logo: text("logo").notNull(),
  description: text("description").notNull(),
  descriptionAr: text("description_ar").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  departmentId: text("department_id")
    .notNull()
    .references(() => department.id, { onDelete: "cascade" }),
  category: categoryEnum("category")
    .array()
    .notNull()
    .default(["professional"]),
  prefix: text("prefix").notNull(),
  processDays: smallint("process_days").notNull().default(0),
  outputDocument: text("output_document"),
  outputDocName: text("output_doc_name"),
  outputDocNameAr: text("output_doc_name_ar"),
  eligibleBy: eligibleByEnum("eligible_by").notNull().default("always"),
  eligibleStatus: text("eligible_status").array().default([]),
  completionStatus: jsonb("completion_status")
    .$type<CompletionStatus>()
    .default(null),
  registerCompany: boolean("register_company").notNull().default(false),
  completionScript: jsonb("completion_script")
    .$type<CompletionScriptType[]>()
    .default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const serviceRelations = relations(service, ({ one, many }) => ({
  department: one(department, {
    fields: [service.departmentId],
    references: [department.id],
  }),
  catalog: many(catalog),
  prerequisite: many(prerequisite),
}));
