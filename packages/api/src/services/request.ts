import { db } from "@e-service/db";
import { and, desc, eq, inArray, like, sql } from "@e-service/db/drizzle/orm";
import {
  action,
  documentTemplate,
  professional,
  request,
  requestAssignee,
  requestHistory,
  service,
  uploadedFile,
} from "@e-service/db/schema/index";
import type {
  FieldRule,
  VisibilityCondition,
} from "@e-service/db/schema/service/form";
import type { ActionCondition } from "@e-service/db/schema/service/stage";
import { sendMail } from "@e-service/email";
import { ORPCError } from "@orpc/server";
import type { Context } from "../context";
import type { CreateRequestInput, UpdateRequestInput } from "../types/request";

const getFieldValue = (
  formData: Record<string, unknown> | undefined,
  fieldId: string,
): unknown => {
  if (!formData) return undefined;
  if (fieldId in formData) return formData[fieldId];
  return fieldId.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, formData);
};

const isEmpty = (v: unknown): boolean =>
  v === null ||
  v === undefined ||
  v === "" ||
  (Array.isArray(v) && v.length === 0);

const evaluateRule = (
  rule: FieldRule,
  formData: Record<string, unknown> | undefined,
): boolean => {
  const fieldValue = getFieldValue(formData, rule.fieldId);
  const target = rule.value;
  switch (rule.operator) {
    case "eq":
      return fieldValue === target;
    case "neq":
      return fieldValue !== target;
    case "in":
      return Array.isArray(target) && target.includes(fieldValue as string);
    case "nin":
      return Array.isArray(target) && !target.includes(fieldValue as string);
    case "gt":
      return Number(fieldValue) > Number(target);
    case "lt":
      return Number(fieldValue) < Number(target);
    case "gte":
      return Number(fieldValue) >= Number(target);
    case "lte":
      return Number(fieldValue) <= Number(target);
    case "empty":
      return isEmpty(fieldValue);
    case "not_empty":
      return !isEmpty(fieldValue);
    case "contains":
      return String(fieldValue ?? "").includes(String(target ?? ""));
    case "not_contains":
      return !String(fieldValue ?? "").includes(String(target ?? ""));
    case "starts_with":
      return String(fieldValue ?? "").startsWith(String(target ?? ""));
    case "ends_with":
      return String(fieldValue ?? "").endsWith(String(target ?? ""));
    default:
      return false;
  }
};

const evaluateCondition = (
  condition: VisibilityCondition | null | undefined,
  formData: Record<string, unknown> | undefined,
): boolean => {
  if (!condition) return true;
  if ("rules" in condition) {
    const results = condition.rules.map((r) => evaluateRule(r, formData));
    return condition.logic === "or"
      ? results.some(Boolean)
      : results.every(Boolean);
  }
  return evaluateRule(condition, formData);
};

const evaluateShowCondition = (
  cond: ActionCondition | null | undefined,
  userRole: "external" | "internal",
  requestStatus: string,
): boolean => {
  if (!cond) return true;
  const hasStatuses = (cond.statuses?.length ?? 0) > 0;
  const hasRoles = (cond.roles?.length ?? 0) > 0;
  const statusOk = hasStatuses
    ? (cond.statuses as string[]).includes(requestStatus)
    : true;
  const roleOk = hasRoles ? (cond.roles as string[]).includes(userRole) : true;
  if (cond.operator === "OR" && hasStatuses && hasRoles) {
    return statusOk || roleOk;
  }
  return statusOk && roleOk;
};

const FILE_KEY_PREFIX = "service/request/";

const collectFileKeys = (value: unknown, out: Set<string>): void => {
  if (typeof value === "string") {
    if (value.startsWith(FILE_KEY_PREFIX)) out.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectFileKeys(v, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectFileKeys(v, out);
  }
};

export const createRequest = async ({
  input,
  context,
}: {
  input: CreateRequestInput;
  context: Context;
}) => {
  const user = context?.session?.user;

  if (!user) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }
  if (user.role !== "external") {
    throw new ORPCError("FORBIDDEN", {
      message: "You are not allowed to create a request",
    });
  }

  const [serviceData, professionalData] = await Promise.all([
    db.query.service.findFirst({
      where: eq(service.id, input.serviceId),
      columns: {
        id: true,
        category: true,
        prefix: true,
      },
      with: {
        stages: {
          where: (s, { eq: eqFn }) => eqFn(s.isActive, true),
          columns: {
            id: true,
            order: true,
          },
          orderBy: (s, { asc }) => [asc(s.order)],
          with: {
            actions: {
              where: inArray(action.typeExternal, ["submit", "payment"]),
              columns: {
                id: true,
                typeExternal: true,
                typeInternal: true,
                outcome: true,
                showCondition: true,
              },
              orderBy: (a, { asc }) => [asc(a.order)],
              with: {
                completeStages: { columns: { stageId: true } },
                skipStages: {
                  columns: {
                    id: true,
                    stageId: true,
                    condition: true,
                    outcome: true,
                  },
                },
                emails: {
                  columns: { emailTemplateId: true },
                  with: {
                    emailTemplate: {
                      columns: {
                        id: true,
                        subject: true,
                        html: true,
                        isActive: true,
                      },
                    },
                    attachments: {
                      columns: {
                        documentTemplateId: true,
                        fileUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    db.query.professional.findFirst({
      where: eq(professional.userId, user.id),
      columns: { id: true },
    }),
  ]);

  if (!serviceData) {
    throw new ORPCError("NOT_FOUND", { message: "Service not found" });
  }
  if (!serviceData.category.includes(input.category)) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Service does not support this category",
    });
  }

  const stages = serviceData.stages;
  const firstStage = stages.at(0);
  const lastStage = stages.at(-1);
  const nextStage = stages.at(1);

  if (!firstStage) {
    throw new ORPCError("NOT_FOUND", {
      message: "No active stage found for this service",
    });
  }

  const submitAction = firstStage.actions.find(
    (a) => a.typeExternal === "submit",
  );
  if (!submitAction) {
    throw new ORPCError("NOT_FOUND", {
      message: "Submit action not found for the first stage",
    });
  }

  if (!evaluateShowCondition(submitAction.showCondition, "external", "")) {
    throw new ORPCError("FORBIDDEN", {
      message: "Submit action is not available",
    });
  }

  const isCompleted = submitAction.completeStages.some(
    (s) => s.stageId === lastStage?.id,
  );

  const matchedSkipStages = submitAction.skipStages.filter((skip) =>
    evaluateCondition(skip.condition, input.formData),
  );
  const effectiveOutcome =
    matchedSkipStages.find((s) => s.outcome)?.outcome ?? submitAction.outcome;

  const requestStatus = effectiveOutcome?.requestStatus;
  const assignees = effectiveOutcome?.assignment;
  if (!assignees) {
    throw new ORPCError("UNPROCESSABLE_CONTENT", {
      message: "Submit action outcome is missing assignment",
    });
  }
  if (!requestStatus?.en || !requestStatus?.ar) {
    throw new ORPCError("UNPROCESSABLE_CONTENT", {
      message: "Submit action outcome is missing request status",
    });
  }

  const assigneeUserIds =
    assignees.type === "applicant" ? [user.id] : assignees.userIds;

  const isRejectAction =
    submitAction.typeInternal === "reject" ||
    submitAction.typeExternal === "withdraw";

  const currentYear = new Date().getFullYear().toString().slice(-2);
  const prefix = serviceData.prefix ?? "REQ";
  const yearPrefix = `${prefix}-${currentYear}-`;

  const advisedCurrentStageId = isRejectAction
    ? firstStage.id
    : (nextStage?.id ?? firstStage.id);

  const requestNo = await db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtextextended(${`req:${serviceData.id}:${currentYear}`}, 0))`,
    );

    const lastRequest = await tx.query.request.findFirst({
      where: and(
        eq(request.serviceId, serviceData.id),
        like(request.serviceRequestNo, `${yearPrefix}%`),
      ),
      columns: { serviceRequestNo: true },
      orderBy: desc(request.createdAt),
    });

    const lastCounter = lastRequest?.serviceRequestNo?.split("-").at(-1);
    const nextCounter = lastCounter ? Number.parseInt(lastCounter, 10) + 1 : 1;
    const generatedRequestNo = `${yearPrefix}${nextCounter}`;

    const [insertedRequest] = await tx
      .insert(request)
      .values({
        requestedBy: user.id,
        category: input.category,
        serviceId: serviceData.id,
        serviceRequestNo: generatedRequestNo,
        status: requestStatus.en,
        statusAr: requestStatus.ar,
        companyId: input?.companyId ?? null,
        completedAt: isCompleted ? new Date() : null,
        cancelledAt: isRejectAction ? new Date() : null,
        paymentStatus: effectiveOutcome?.paymentStatus?.en ?? null,
        paymentStatusAr: effectiveOutcome?.paymentStatus?.ar ?? null,
        submissionDate: new Date(),
        currentStageId: advisedCurrentStageId,
        formData: input.formData,
        professionalId: professionalData?.id ?? null,
      })
      .returning();

    if (!insertedRequest) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create request",
      });
    }

    if (assigneeUserIds.length > 0) {
      await tx.insert(requestAssignee).values(
        assigneeUserIds.map((userId) => ({
          requestId: insertedRequest.id,
          userId,
        })),
      );
    }

    const historyTimestamp = new Date();
    const historyRows: (typeof requestHistory.$inferInsert)[] = [
      ...submitAction.completeStages.map((s) => ({
        requestId: insertedRequest.id,
        stageId: s.stageId,
        actionId: submitAction.id,
        performedBy: user.id,
        completedAt: isRejectAction ? null : historyTimestamp,
        cancelledAt: isRejectAction ? historyTimestamp : null,
      })),
      ...matchedSkipStages.map((s) => ({
        requestId: insertedRequest.id,
        stageId: s.stageId,
        actionId: submitAction.id,
        performedBy: user.id,
        skippedAt: historyTimestamp,
      })),
    ];

    if (historyRows.length > 0) {
      await tx.insert(requestHistory).values(historyRows);
    }

    const candidateKeys = new Set<string>();
    collectFileKeys(input.formData, candidateKeys);
    if (candidateKeys.size > 0) {
      await tx
        .delete(uploadedFile)
        .where(
          and(
            inArray(uploadedFile.key, [...candidateKeys]),
            eq(uploadedFile.uploadedBy, user.id),
          ),
        );
    }

    return generatedRequestNo;
  });

  await sendActionEmails(submitAction, user.email);

  const isPaymentStage =
    nextStage?.actions.some((a) => a.typeExternal === "payment") ?? false;

  return {
    requestNo,
    isPaymentStage,
  };
};

export const updateRequest = async ({
  input,
  context,
}: {
  input: UpdateRequestInput;
  context: Context;
}) => {
  const user = context?.session?.user;

  if (!user) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }
  if (user.role !== "external" && user.role !== "internal") {
    throw new ORPCError("FORBIDDEN", {
      message: "You are not allowed to update this request",
    });
  }
  const userRole = user.role as "external" | "internal";
  const isInternal = userRole === "internal";

  const existingRequest = await db.query.request.findFirst({
    where: eq(request.serviceRequestNo, input.requestNo),
    columns: {
      id: true,
      serviceId: true,
      currentStageId: true,
      status: true,
    },
    with: {
      currentStage: {
        columns: { id: true, order: true },
      },
      assignees: {
        columns: { userId: true },
      },
    },
  });

  if (!existingRequest) {
    throw new ORPCError("NOT_FOUND", { message: "Request not found" });
  }
  if (!existingRequest.currentStage) {
    throw new ORPCError("UNPROCESSABLE_CONTENT", {
      message: "Request has no current stage",
    });
  }

  const isAssigned = existingRequest.assignees.some(
    (a) => a.userId === user.id,
  );
  if (!isAssigned) {
    throw new ORPCError("FORBIDDEN", {
      message: "You are not assigned to this request",
    });
  }

  const currentStageOrder = existingRequest.currentStage.order;

  const [actionData, serviceStages] = await Promise.all([
    db.query.action.findFirst({
      where: eq(action.id, input.actionId),
      columns: {
        id: true,
        stageId: true,
        typeExternal: true,
        typeInternal: true,
        outcome: true,
        showCondition: true,
      },
      with: {
        completeStages: { columns: { stageId: true } },
        skipStages: {
          columns: {
            id: true,
            stageId: true,
            condition: true,
            outcome: true,
          },
        },
        emails: {
          columns: { emailTemplateId: true },
          with: {
            emailTemplate: {
              columns: {
                id: true,
                subject: true,
                html: true,
                isActive: true,
              },
            },
            attachments: {
              columns: {
                documentTemplateId: true,
                fileUrl: true,
              },
            },
          },
        },
      },
    }),
    db.query.service.findFirst({
      where: eq(service.id, existingRequest.serviceId),
      columns: { id: true },
      with: {
        stages: {
          where: (s, { eq: eqFn }) => eqFn(s.isActive, true),
          columns: { id: true, order: true },
          orderBy: (s, { asc }) => [asc(s.order)],
          with: {
            actions: {
              where: eq(action.typeExternal, "payment"),
              columns: { id: true, typeExternal: true },
            },
          },
        },
      },
    }),
  ]);

  if (!actionData) {
    throw new ORPCError("NOT_FOUND", { message: "Action not found" });
  }
  if (actionData.stageId !== existingRequest.currentStageId) {
    throw new ORPCError("FORBIDDEN", {
      message: "Action does not belong to the current stage of this request",
    });
  }

  if (isInternal) {
    if (!actionData.typeInternal) {
      throw new ORPCError("FORBIDDEN", {
        message: "Action is not available for internal users",
      });
    }
  } else {
    if (!actionData.typeExternal) {
      throw new ORPCError("FORBIDDEN", {
        message: "Action is not available for external users",
      });
    }
  }

  if (
    !evaluateShowCondition(
      actionData.showCondition,
      userRole,
      existingRequest.status,
    )
  ) {
    throw new ORPCError("FORBIDDEN", {
      message: "Action is not available under current conditions",
    });
  }

  const stages = serviceStages?.stages ?? [];
  const lastStage = stages.at(-1);
  const nextStage = stages.find((s) => s.order > currentStageOrder);

  const isCompleted = actionData.completeStages.some(
    (s) => s.stageId === lastStage?.id,
  );

  const matchedSkipStages = actionData.skipStages.filter((skip) =>
    evaluateCondition(skip.condition, input.formData),
  );
  const effectiveOutcome =
    matchedSkipStages.find((s) => s.outcome)?.outcome ?? actionData.outcome;

  const requestStatus = effectiveOutcome?.requestStatus;
  const assignment = effectiveOutcome?.assignment;
  if (!assignment) {
    throw new ORPCError("UNPROCESSABLE_CONTENT", {
      message: "Action outcome is missing assignment",
    });
  }
  if (!requestStatus?.en || !requestStatus?.ar) {
    throw new ORPCError("UNPROCESSABLE_CONTENT", {
      message: "Action outcome is missing request status",
    });
  }

  const newAssigneeUserIds =
    assignment.type === "applicant"
      ? // applicant routing — preserve requestedBy by re-querying not needed; keep user.id only if external
        [user.id]
      : assignment.userIds;

  const isRejectAction =
    actionData.typeInternal === "reject" ||
    actionData.typeExternal === "withdraw";

  const nextCurrentStageId = isRejectAction
    ? existingRequest.currentStageId
    : (nextStage?.id ?? existingRequest.currentStageId);

  await db.transaction(async (tx) => {
    await tx
      .update(request)
      .set({
        status: requestStatus.en,
        statusAr: requestStatus.ar,
        completedAt: isCompleted ? new Date() : null,
        cancelledAt: isRejectAction ? new Date() : null,
        paymentStatus: effectiveOutcome?.paymentStatus?.en ?? null,
        paymentStatusAr: effectiveOutcome?.paymentStatus?.ar ?? null,
        currentStageId: nextCurrentStageId,
        formData: input.formData,
      })
      .where(eq(request.id, existingRequest.id));

    const existingAssigneeIds = new Set(
      existingRequest.assignees.map((a) => a.userId),
    );
    const newAssigneeIdSet = new Set(newAssigneeUserIds);
    const toRemove = [...existingAssigneeIds].filter(
      (id) => !newAssigneeIdSet.has(id),
    );
    const toAdd = [...newAssigneeIdSet].filter(
      (id) => !existingAssigneeIds.has(id),
    );

    if (toRemove.length > 0) {
      await tx
        .delete(requestAssignee)
        .where(
          and(
            eq(requestAssignee.requestId, existingRequest.id),
            inArray(requestAssignee.userId, toRemove),
          ),
        );
    }
    if (toAdd.length > 0) {
      await tx.insert(requestAssignee).values(
        toAdd.map((userId) => ({
          requestId: existingRequest.id,
          userId,
        })),
      );
    }

    const historyTimestamp = new Date();
    const historyRows: (typeof requestHistory.$inferInsert)[] = [
      ...actionData.completeStages.map((s) => ({
        requestId: existingRequest.id,
        stageId: s.stageId,
        actionId: actionData.id,
        performedBy: user.id,
        completedAt: isRejectAction ? null : historyTimestamp,
        cancelledAt: isRejectAction ? historyTimestamp : null,
      })),
      ...matchedSkipStages.map((s) => ({
        requestId: existingRequest.id,
        stageId: s.stageId,
        actionId: actionData.id,
        performedBy: user.id,
        skippedAt: historyTimestamp,
      })),
    ];

    if (historyRows.length > 0) {
      await tx.insert(requestHistory).values(historyRows);
    }

    const candidateKeys = new Set<string>();
    collectFileKeys(input.formData, candidateKeys);
    if (candidateKeys.size > 0) {
      await tx
        .delete(uploadedFile)
        .where(
          and(
            inArray(uploadedFile.key, [...candidateKeys]),
            eq(uploadedFile.uploadedBy, user.id),
          ),
        );
    }
  });

  await sendActionEmails(actionData, user.email);

  if (isInternal) {
    return { requestNo: input.requestNo };
  }

  const isPaymentStage =
    nextStage?.actions.some((a) => a.typeExternal === "payment") ?? false;

  return {
    requestNo: input.requestNo,
    isPaymentStage,
  };
};

type ActionForEmail = {
  emails: {
    emailTemplateId: string | null;
    emailTemplate: {
      id: string;
      subject: string;
      html: string;
      isActive: boolean;
    } | null;
    attachments: {
      documentTemplateId: string | null;
      fileUrl: string | null;
    }[];
  }[];
};

const sendActionEmails = async (
  actionData: ActionForEmail,
  recipient: string | null | undefined,
): Promise<void> => {
  if (!recipient) return;

  const activeEmails = actionData.emails.filter(
    (e) =>
      e.emailTemplateId &&
      e.emailTemplate?.isActive &&
      e.emailTemplate.subject &&
      e.emailTemplate.html,
  );
  if (activeEmails.length === 0) return;

  const allDocIds = [
    ...new Set(
      activeEmails.flatMap((e) =>
        e.attachments
          .filter((a) => a.documentTemplateId)
          .map((a) => a.documentTemplateId as string),
      ),
    ),
  ];

  const docMap = new Map<string, { name: string; html: string }>();
  if (allDocIds.length > 0) {
    const docs = await db.query.documentTemplate.findMany({
      where: inArray(documentTemplate.id, allDocIds),
      columns: { id: true, name: true, html: true },
    });
    for (const d of docs) docMap.set(d.id, { name: d.name, html: d.html });
  }

  await Promise.all(
    activeEmails.map((e) => {
      const fileAttachments = e.attachments
        .filter((a) => a.fileUrl)
        .map((a) => ({ path: a.fileUrl as string }));

      const docAttachments = e.attachments
        .filter((a) => a.documentTemplateId)
        .map((a) => {
          const doc = docMap.get(a.documentTemplateId as string);
          return doc
            ? {
                filename: `${doc.name}.html`,
                content: doc.html,
                contentType: "text/html",
              }
            : null;
        })
        .filter((a): a is NonNullable<typeof a> => a !== null);

      const attachments = [...fileAttachments, ...docAttachments];

      console.log(attachments, "attachments");

      return sendMail({
        to: recipient,
        subject: e.emailTemplate?.subject ?? "",
        html: e.emailTemplate?.html ?? "",
        attachments: undefined,
      });
    }),
  );
};
