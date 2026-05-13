import type { ServiceCompletionStatus } from "@e-service/shared/types";
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
import { department } from "../department";
import { documentTemplate } from "../document";
import { categoryEnum } from "../shared";
import { catalog } from "./catalog";
import { prerequisite } from "./prerequisite";
import { stage } from "./stage";

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
    logo: text("logo"),
    description: text("description").notNull(),
    descriptionAr: text("description_ar").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    serviceCode: text("service_code").unique().notNull(),
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
      .$type<ServiceCompletionStatus | null>()
      .default(null),
    registerCompany: boolean("register_company").notNull().default(false),
    completionScript: jsonb("completion_script")
      .$type<CompletionScriptType[]>()
      .default([]),
    createdBy: text("created_by").references(() => user.id),
    updatedBy: text("updated_by").references(() => user.id),
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
