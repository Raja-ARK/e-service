import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "../auth";
import { categoryEnum } from "../common";
import { department } from "../department";
import { documentTemplate } from "../document";
import { catalog } from "./catalog";
import { prerequisite } from "./prerequisite";
import { stage } from "./stage";

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

export const service = pgTable(
  "service",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    nameAr: text("name_ar").notNull(),
    logo: text("logo").notNull(),
    description: text("description").notNull(),
    descriptionAr: text("description_ar").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => department.id, { onDelete: "cascade" }),
    category: categoryEnum("category")
      .array()
      .notNull()
      .default(["professional"]),
    prefix: text("prefix").notNull(),
    processDays: smallint("process_days").notNull().default(0),
    outputDocumentId: uuid("output_document_id").references(
      () => documentTemplate.id,
    ), // FK to document template used as the certificate/output for this service
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
    createdByUserId: text("created_by_user_id").references(() => user.id),
    updatedByUserId: text("updated_by_user_id").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("service_department_id_idx").on(table.departmentId)],
);

export const serviceRelations = relations(service, ({ one, many }) => ({
  department: one(department, {
    fields: [service.departmentId],
    references: [department.id],
  }),
  outputDocument: one(documentTemplate, {
    fields: [service.outputDocumentId],
    references: [documentTemplate.id],
  }),
  catalog: many(catalog),
  prerequisite: many(prerequisite),
  stages: many(stage),
}));
