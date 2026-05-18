import { db } from "@e-service/db";
import { and, desc, eq, inArray } from "@e-service/db/drizzle/orm";
import {
  action,
  professional,
  request,
  requestAssignee,
  service,
  uploadedFile,
} from "@e-service/db/schema/index";
import { ORPCError } from "@orpc/server";
import type { Context } from "../context";
import type { CreateRequestInput, UpdateRequestInput } from "../types/request";

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

  const [serviceData, lastRequest, lastServiceStage, professionalData] =
    await Promise.all([
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
                      stageId: true,
                    },
                  },
                  emails: {
                    columns: {
                      emailTemplateId: true,
                    },
                    with: {
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

  const requestStatus = submitAction.outcome?.requestStatus;
  const assignees = submitAction.outcome?.assignment;
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
        paymentStatus: submitAction.outcome?.paymentStatus?.en,
        paymentStatusAr: submitAction.outcome?.paymentStatus?.ar,
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

  return {
    requestNo,
    isPaymentStage: false,
  };
};

export const updateRequest = async ({
  input,
  context: _context,
}: {
  input: UpdateRequestInput;
  context: Context;
}) => {
  return {
    requestNo: input.requestNo,
    isPaymentStage: false,
  };
};
