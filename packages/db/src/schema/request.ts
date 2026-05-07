import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { categoryEnum } from "./common";
import { company } from "./company";
import { professional } from "./professional";
import { service } from "./service/service";
import { action, stage } from "./service/stage";

export const request = pgTable(
  "request",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceId: uuid("service_id")
      .references(() => service.id)
      .notNull(),
    serviceRequestNo: text("service_request_no").unique().notNull(),
    status: text("status").notNull(),
    statusAr: text("status_ar").notNull(),
    submissionDate: timestamp("submission_date").defaultNow().notNull(),
    requestedUserId: text("requested_user_id")
      .references(() => user.id)
      .notNull(),
    category: categoryEnum("category").notNull(),
    currentStageId: uuid("current_stage_id").references(() => stage.id),
    companyId: uuid("company_id").references(() => company.id),
    professionalId: uuid("professional_id").references(() => professional.id),
    paymentStatus: text("payment_status"),
    paymentStatusAr: text("payment_status_ar"),
    completedAt: timestamp("completed_at"),
    cancelledAt: timestamp("cancelled_at"),
    formData: jsonb("form_data").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("request_service_id_idx").on(table.serviceId),
    index("request_requested_user_id_idx").on(table.requestedUserId),
    index("request_current_stage_id_idx").on(table.currentStageId),
    index("request_company_id_idx").on(table.companyId),
    index("request_professional_id_idx").on(table.professionalId),
    index("request_status_submission_date_idx").on(
      table.status,
      table.submissionDate,
    ),
  ],
);

export const requestHistory = pgTable(
  "request_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id")
      .references(() => request.id)
      .notNull(),
    stageId: uuid("stage_id")
      .references(() => stage.id)
      .notNull(),
    stageCompletedAt: timestamp("stage_completed_at"),
    actionId: uuid("action_id").references(() => action.id),
    performedByUserId: text("performed_by_user_id")
      .references(() => user.id)
      .notNull(),
    comments: text("comments"),
    status: text("status"),
    statusAr: text("status_ar"),
    paymentStatus: text("payment_status"),
    paymentStatusAr: text("payment_status_ar"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("request_history_request_id_idx").on(table.requestId),
    index("request_history_stage_id_idx").on(table.stageId),
    index("request_history_performed_by_user_id_idx").on(
      table.performedByUserId,
    ),
    index("request_history_request_created_at_idx").on(
      table.requestId,
      table.createdAt,
    ),
  ],
);

// Junction: multiple internal users can be assigned to a request
export const requestAssignee = pgTable(
  "request_assignee",
  {
    requestId: uuid("request_id")
      .notNull()
      .references(() => request.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("request_assignee_request_id_idx").on(table.requestId),
    index("request_assignee_user_id_idx").on(table.userId),
  ],
);

export const requestRelations = relations(request, ({ one, many }) => ({
  service: one(service, {
    fields: [request.serviceId],
    references: [service.id],
  }),
  applicant: one(user, {
    fields: [request.requestedUserId],
    references: [user.id],
    relationName: "applicant",
  }),
  assignees: many(requestAssignee), // use junction table — array FK not valid in PG/Drizzle
  currentStage: one(stage, {
    fields: [request.currentStageId],
    references: [stage.id],
  }),
  company: one(company, {
    fields: [request.companyId],
    references: [company.id],
  }),
  professional: one(professional, {
    fields: [request.professionalId],
    references: [professional.id],
  }),
  history: many(requestHistory),
}));

export const requestAssigneeRelations = relations(
  requestAssignee,
  ({ one }) => ({
    request: one(request, {
      fields: [requestAssignee.requestId],
      references: [request.id],
    }),
    user: one(user, {
      fields: [requestAssignee.userId],
      references: [user.id],
    }),
  }),
);

export const requestHistoryRelations = relations(requestHistory, ({ one }) => ({
  request: one(request, {
    fields: [requestHistory.requestId],
    references: [request.id],
  }),
  stage: one(stage, {
    fields: [requestHistory.stageId],
    references: [stage.id],
  }),
  action: one(action, {
    fields: [requestHistory.actionId],
    references: [action.id],
  }),
  performedBy: one(user, {
    fields: [requestHistory.performedByUserId],
    references: [user.id],
  }),
}));
