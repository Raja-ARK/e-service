import { db } from "@e-service/db";
import { and, desc, eq, inArray } from "@e-service/db/drizzle/orm";
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

  const [
    serviceData,
    lastRequest,
    lastServiceStage,
    nextServiceStage,
    professionalData,
  ] = await Promise.all([
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
          },
          orderBy: (s, { asc }) => [asc(s.order)],
          limit: 1,
          with: {
            actions: {
              where: eq(action.typeExternal, "submit"),
              columns: {
                id: true,
                typeExternal: true,
                typeInternal: true,
                outcome: true,
              },
              limit: 1,
              orderBy: (a, { asc }) => [asc(a.order)],
              with: {
                completeStages: {
                  columns: {
                    stageId: true,
                  },
                },
                removeStages: {
                  columns: {
                    stageId: true,
                  },
                },
                skipStages: {
                  columns: {
                    id: true,
                    stageId: true,
                    condition: true,
                    outcome: true,
                  },
                },
                emails: {
                  columns: {
                    emailTemplateId: true,
                  },
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
    db.query.request.findFirst({
      where: eq(request.serviceId, input.serviceId),
      columns: {
        serviceRequestNo: true,
      },
      orderBy: desc(request.createdAt),
    }),
    db.query.service.findFirst({
      where: eq(service.id, input.serviceId),
      columns: {
        id: true,
      },
      with: {
        stages: {
          where: (s, { eq: eqFn }) => eqFn(s.isActive, true),
          columns: {
            id: true,
          },
          orderBy: (s, { desc }) => [desc(s.order)],
          limit: 1,
        },
      },
    }),
    db.query.service.findFirst({
      where: eq(service.id, input.serviceId),
      columns: {
        id: true,
      },
      with: {
        stages: {
          where: (s, { eq: eqFn }) => eqFn(s.isActive, true),
          columns: {
            id: true,
          },
          orderBy: (s, { asc }) => [asc(s.order)],
          limit: 1,
          offset: 1,
          with: {
            actions: {
              where: eq(action.typeExternal, "payment"),
              columns: {
                id: true,
                typeExternal: true,
              },
              limit: 1,
            },
          },
        },
      },
    }),
    db.query.professional.findFirst({
      where: eq(professional.userId, user.id),
      columns: {
        id: true,
      },
    }),
  ]);

  if (!serviceData) {
    throw new ORPCError("NOT_FOUND", { message: "Service not found" });
  }
  if (!serviceData?.category.includes(input.category)) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Service does not support this category",
    });
  }

  const firstStage = serviceData.stages.at(0);
  const lastStage = lastServiceStage?.stages.at(0);
  const submitAction = firstStage?.actions.find(
    (stageAction) => stageAction.typeExternal === "submit",
  );
  const isCompleted =
    submitAction?.completeStages.some(
      (stage) => stage.stageId === lastStage?.id,
    ) ?? false;

  if (!firstStage) {
    throw new ORPCError("NOT_FOUND", {
      message: "No active stage found for this service",
    });
  }

  if (!submitAction) {
    throw new ORPCError("NOT_FOUND", {
      message: "Submit action not found for the first stage",
    });
  }

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

  const lastRequestNo = lastRequest?.serviceRequestNo?.split("-")?.[2];
  const currentYear = new Date().getFullYear().toString().slice(-2);

  const requestNo = `${serviceData?.prefix}-${currentYear}-${lastRequestNo ? Number.parseInt(lastRequestNo, 10) + 1 : 1}`;
  const assigneeUserIds =
    assignees.type === "applicant" ? [user.id] : assignees.userIds;

  await db.transaction(async (tx) => {
    const [insertedRequest] = await tx
      .insert(request)
      .values({
        requestedBy: user.id,
        category: input.category,
        serviceId: serviceData.id,
        serviceRequestNo: requestNo,
        status: requestStatus.en,
        statusAr: requestStatus.ar,
        companyId: input?.companyId ?? null,
        completedAt: isCompleted ? new Date() : null,
        paymentStatus: effectiveOutcome?.paymentStatus?.en,
        paymentStatusAr: effectiveOutcome?.paymentStatus?.ar,
        submissionDate: new Date(),
        currentStageId: firstStage.id,
        formData: input.formData,
        professionalId: professionalData?.id ?? null,
      })
      .returning();

    if (!insertedRequest) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create request",
      });
    }

    await tx.insert(requestAssignee).values(
      assigneeUserIds.map((userId) => ({
        requestId: insertedRequest.id,
        userId,
      })),
    );

    const historyTimestamp = new Date();
    const isRejectAction =
      submitAction.typeInternal === "reject" ||
      submitAction.typeExternal === "withdraw";

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

    return insertedRequest;
  });

  const recipient = user.email;
  if (recipient) {
    const activeEmails = submitAction.emails.filter(
      (e) =>
        e.emailTemplateId &&
        e.emailTemplate?.isActive &&
        e.emailTemplate.subject &&
        e.emailTemplate.html,
    );

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
  }

  const nextStage = nextServiceStage?.stages.at(0);
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

  const existingRequest = await db.query.request.findFirst({
    where: eq(request.serviceRequestNo, input.requestNo),
    columns: {
      id: true,
      serviceId: true,
      currentStageId: true,
      category: true,
    },
    with: {
      currentStage: {
        columns: {
          id: true,
          order: true,
        },
      },
      assignees: {
        columns: {
          userId: true,
        },
      },
    },
  });

  if (!existingRequest) {
    throw new ORPCError("NOT_FOUND", { message: "Request not found" });
  }

  const isAssigned = existingRequest.assignees.some(
    (a) => a.userId === user.id,
  );
  if (!isAssigned) {
    throw new ORPCError("FORBIDDEN", {
      message: "You are not assigned to this request",
    });
  }

  const currentStageOrder = existingRequest.currentStage?.order ?? 0;

  const [serviceData, lastServiceStage, nextServiceStage] = await Promise.all([
    db.query.service.findFirst({
      where: eq(service.id, existingRequest.serviceId),
      columns: {
        id: true,
        category: true,
        prefix: true,
      },
      with: {
        stages: {
          where: (s, { eq: eqFn, and: andFn }) =>
            andFn(
              eqFn(s.isActive, true),
              eqFn(s.id, existingRequest.currentStageId),
            ),
          columns: {
            id: true,
          },
          limit: 1,
          with: {
            actions: {
              where: eq(action.typeExternal, "submit"),
              columns: {
                id: true,
                typeExternal: true,
                typeInternal: true,
                outcome: true,
              },
              limit: 1,
              orderBy: (a, { asc }) => [asc(a.order)],
              with: {
                completeStages: {
                  columns: {
                    stageId: true,
                  },
                },
                removeStages: {
                  columns: {
                    stageId: true,
                  },
                },
                skipStages: {
                  columns: {
                    id: true,
                    stageId: true,
                    condition: true,
                    outcome: true,
                  },
                },
                emails: {
                  columns: {
                    emailTemplateId: true,
                  },
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
    db.query.service.findFirst({
      where: eq(service.id, existingRequest.serviceId),
      columns: {
        id: true,
      },
      with: {
        stages: {
          where: (s, { eq: eqFn }) => eqFn(s.isActive, true),
          columns: {
            id: true,
          },
          orderBy: (s, { desc }) => [desc(s.order)],
          limit: 1,
        },
      },
    }),
    db.query.service.findFirst({
      where: eq(service.id, existingRequest.serviceId),
      columns: {
        id: true,
      },
      with: {
        stages: {
          where: (s, { eq: eqFn, and: andFn, gt: gtFn }) =>
            andFn(eqFn(s.isActive, true), gtFn(s.order, currentStageOrder)),
          columns: {
            id: true,
          },
          orderBy: (s, { asc }) => [asc(s.order)],
          limit: 1,
          with: {
            actions: {
              where: eq(action.typeExternal, "payment"),
              columns: {
                id: true,
                typeExternal: true,
              },
              limit: 1,
            },
          },
        },
      },
    }),
  ]);

  if (!serviceData) {
    throw new ORPCError("NOT_FOUND", { message: "Service not found" });
  }

  const currentStage = serviceData.stages.at(0);
  const lastStage = lastServiceStage?.stages.at(0);
  const submitAction = currentStage?.actions.find(
    (stageAction) => stageAction.typeExternal === "submit",
  );

  if (!currentStage) {
    throw new ORPCError("NOT_FOUND", {
      message: "Current stage not found or inactive",
    });
  }

  if (!submitAction) {
    throw new ORPCError("NOT_FOUND", {
      message: "Submit action not found for the current stage",
    });
  }

  const isCompleted =
    submitAction.completeStages.some((s) => s.stageId === lastStage?.id) ??
    false;

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

  await db.transaction(async (tx) => {
    await tx
      .update(request)
      .set({
        status: requestStatus.en,
        statusAr: requestStatus.ar,
        completedAt: isCompleted ? new Date() : null,
        paymentStatus: effectiveOutcome?.paymentStatus?.en,
        paymentStatusAr: effectiveOutcome?.paymentStatus?.ar,
        formData: input.formData,
      })
      .where(eq(request.id, existingRequest.id));

    await tx
      .delete(requestAssignee)
      .where(eq(requestAssignee.requestId, existingRequest.id));

    if (assigneeUserIds.length > 0) {
      await tx.insert(requestAssignee).values(
        assigneeUserIds.map((userId) => ({
          requestId: existingRequest.id,
          userId,
        })),
      );
    }

    const historyTimestamp = new Date();
    const isRejectAction =
      submitAction.typeInternal === "reject" ||
      submitAction.typeExternal === "withdraw";

    const historyRows: (typeof requestHistory.$inferInsert)[] = [
      ...submitAction.completeStages.map((s) => ({
        requestId: existingRequest.id,
        stageId: s.stageId,
        actionId: submitAction.id,
        performedBy: user.id,
        completedAt: isRejectAction ? null : historyTimestamp,
        cancelledAt: isRejectAction ? historyTimestamp : null,
      })),
      ...matchedSkipStages.map((s) => ({
        requestId: existingRequest.id,
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
  });

  const recipient = user.email;
  if (recipient) {
    const activeEmails = submitAction.emails.filter(
      (e) =>
        e.emailTemplateId &&
        e.emailTemplate?.isActive &&
        e.emailTemplate.subject &&
        e.emailTemplate.html,
    );

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
  }

  const nextStage = nextServiceStage?.stages.at(0);
  const isPaymentStage =
    nextStage?.actions.some((a) => a.typeExternal === "payment") ?? false;

  return {
    requestNo: input.requestNo,
    isPaymentStage,
  };
};
