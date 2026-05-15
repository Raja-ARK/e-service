import { db } from "@e-service/db";
import { and, count, eq, or } from "@e-service/db/drizzle/orm";
import {
  action,
  actionCompleteStage,
  actionEmail,
  actionEmailAttachment,
  actionRemoveStage,
  actionSkipStage,
} from "@e-service/db/schema/service/stage";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { deleteFile, uploadFile } from "@e-service/storage";
import { generateKey } from "@e-service/storage/utils";
import { ORPCError } from "@orpc/server";
import type { Context } from "../../context";
import { ACTION_SORT_FIELDS } from "../../schema/service/action";
import type {
  ActionIdInput,
  CreateActionInput,
  ListActionsInput,
  UpdateActionInput,
} from "../../types/service/action";
import { buildWhereClause } from "../../utils/filter";
import { buildOrderBy } from "../../utils/sort";

const columns = {
  createdAt: false,
  updatedAt: false,
  createdBy: false,
  updatedBy: false,
} as const;

const uploadActionFile = async (file: File, prefix: string) => {
  const key = generateKey(file, prefix);
  const { data: uploaded, error } = await tryCatch(
    uploadFile(key, file, {
      contentType: file.type || undefined,
      metadata: { originalName: file.name },
    }),
  );
  if (error) return undefined;
  return uploaded ? key : undefined;
};

export const listActions = async ({ input }: { input: ListActionsInput }) => {
  const { page, limit, filter, filterCondition, sort, withoutPagination } =
    input;

  const conditions = filter
    ? [
        buildWhereClause(action.stageId, filter.stageId),
        buildWhereClause(action.actionName, filter.actionName),
        buildWhereClause(action.actionNameAr, filter.actionNameAr),
        buildWhereClause(action.disabled, filter.disabled),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.action.findMany({
      columns,
      where,
      orderBy: (a) =>
        buildOrderBy(a, sort, ACTION_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
    });
    return {
      data: rows,
      total: rows.length,
      totalPages: 1,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
    };
  }

  const offset = (page - 1) * limit;

  const [rows, [total]] = await Promise.all([
    db.query.action.findMany({
      columns,
      where,
      orderBy: (a) =>
        buildOrderBy(a, sort, ACTION_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(action).where(where),
  ]);

  const totalPages = Math.ceil((total?.value ?? 0) / limit);

  return {
    data: rows,
    total: total?.value ?? 0,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

export const getAction = async ({ input }: { input: ActionIdInput }) => {
  const found = await db.query.action.findFirst({
    where: eq(action.id, input.id),
    columns,
    with: {
      completeStages: {
        with: {
          stage: {
            columns: {
              id: true,
              title: true,
              titleAr: true,
            },
          },
        },
      },
      removeStages: {
        with: {
          stage: {
            columns: {
              id: true,
              title: true,
              titleAr: true,
            },
          },
        },
      },
      skipStages: {
        columns: {
          stageId: true,
          condition: true,
          outcome: true,
        },
        with: {
          stage: {
            columns: {
              id: true,
              title: true,
              titleAr: true,
            },
          },
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
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Action not found" });
  return { action: found };
};

export const createAction = async ({
  input,
  context,
}: {
  input: CreateActionInput;
  context: Context;
}) => {
  const {
    icon,
    modalIcon,
    completeStageIds,
    removeStageIds,
    skipStages,
    emails,
    ...actionData
  } = input;

  let iconKey: string | undefined;
  let modalIconKey: string | undefined;

  if (icon) iconKey = await uploadActionFile(icon, "service/stage/action-icon");
  if (modalIcon)
    modalIconKey = await uploadActionFile(
      modalIcon,
      "service/stage/action-modal-icon",
    );

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(action)
        .values({
          ...actionData,
          icon: iconKey ?? null,
          modalIcon: modalIconKey ?? null,
          createdBy: context?.session?.user.id,
          updatedBy: context?.session?.user.id,
        })
        .returning();
      if (!inserted) throw new Error("Failed to create action");

      if (completeStageIds && completeStageIds.length > 0) {
        await tx.insert(actionCompleteStage).values(
          completeStageIds.map((stageId) => ({
            actionId: inserted.id,
            stageId,
          })),
        );
      }

      if (removeStageIds && removeStageIds.length > 0) {
        await tx.insert(actionRemoveStage).values(
          removeStageIds.map((stageId) => ({
            actionId: inserted.id,
            stageId,
          })),
        );
      }

      if (skipStages && skipStages.length > 0) {
        await tx.insert(actionSkipStage).values(
          skipStages.map((s) => ({
            actionId: inserted.id,
            stageId: s.stageId,
            condition: s.condition ?? null,
            outcome: s.outcome ?? null,
          })),
        );
      }

      if (emails && emails.length > 0) {
        for (const email of emails) {
          const [insertedEmail] = await tx
            .insert(actionEmail)
            .values({
              actionId: inserted.id,
              emailTemplateId: email.emailTemplateId,
            })
            .returning();
          if (!insertedEmail) throw new Error("Failed to create action email");

          if (email.attachments.length > 0) {
            await tx.insert(actionEmailAttachment).values(
              email.attachments.map((att) => ({
                actionEmailId: insertedEmail.id,
                documentTemplateId: att.documentTemplateId ?? null,
                fileUrl: att.fileUrl ?? null,
              })),
            );
          }
        }
      }

      return inserted;
    }),
  );

  if (error || !result) {
    if (iconKey) await deleteFile(iconKey).catch(() => {});
    if (modalIconKey) await deleteFile(modalIconKey).catch(() => {});
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create action",
    });
  }

  return { success: true, message: "Action created" };
};

export const updateAction = async ({
  input,
  context,
}: {
  input: UpdateActionInput;
  context: Context;
}) => {
  const {
    id,
    icon,
    modalIcon,
    completeStageIds,
    removeStageIds,
    skipStages,
    emails,
    ...data
  } = input;

  const existing = await db.query.action.findFirst({
    where: eq(action.id, id),
    columns: { icon: true, modalIcon: true },
  });
  if (!existing)
    throw new ORPCError("NOT_FOUND", { message: "Action not found" });

  let newIconKey: string | undefined;
  let newModalIconKey: string | undefined;

  if (icon)
    newIconKey = await uploadActionFile(icon, "service/stage/action-icon");
  if (modalIcon)
    newModalIconKey = await uploadActionFile(
      modalIcon,
      "service/stage/action-modal-icon",
    );

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [updated] = await tx
        .update(action)
        .set({
          ...data,
          icon: icon !== undefined ? (newIconKey ?? null) : undefined,
          modalIcon:
            modalIcon !== undefined ? (newModalIconKey ?? null) : undefined,
          updatedBy: context?.session?.user.id,
        })
        .where(eq(action.id, id))
        .returning();
      if (!updated) throw new Error("Failed to update action");

      if (completeStageIds !== undefined) {
        await tx
          .delete(actionCompleteStage)
          .where(eq(actionCompleteStage.actionId, id));
        if (completeStageIds.length > 0) {
          await tx
            .insert(actionCompleteStage)
            .values(
              completeStageIds.map((stageId) => ({ actionId: id, stageId })),
            );
        }
      }

      if (removeStageIds !== undefined) {
        await tx
          .delete(actionRemoveStage)
          .where(eq(actionRemoveStage.actionId, id));
        if (removeStageIds.length > 0) {
          await tx
            .insert(actionRemoveStage)
            .values(
              removeStageIds.map((stageId) => ({ actionId: id, stageId })),
            );
        }
      }

      if (skipStages !== undefined) {
        await tx
          .delete(actionSkipStage)
          .where(eq(actionSkipStage.actionId, id));
        if (skipStages.length > 0) {
          await tx.insert(actionSkipStage).values(
            skipStages.map((s) => ({
              actionId: id,
              stageId: s.stageId,
              condition: s.condition ?? null,
              outcome: s.outcome ?? null,
            })),
          );
        }
      }

      if (emails !== undefined) {
        await tx.delete(actionEmail).where(eq(actionEmail.actionId, id));
        if (emails.length > 0) {
          for (const email of emails) {
            const [insertedEmail] = await tx
              .insert(actionEmail)
              .values({
                actionId: id,
                emailTemplateId: email.emailTemplateId,
              })
              .returning();
            if (!insertedEmail)
              throw new Error("Failed to update action email");

            if (email.attachments.length > 0) {
              await tx.insert(actionEmailAttachment).values(
                email.attachments.map((att) => ({
                  actionEmailId: insertedEmail.id,
                  documentTemplateId: att.documentTemplateId ?? null,
                  fileUrl: att.fileUrl ?? null,
                })),
              );
            }
          }
        }
      }

      return updated;
    }),
  );

  if (error || !result) {
    if (newIconKey) await deleteFile(newIconKey).catch(() => {});
    if (newModalIconKey) await deleteFile(newModalIconKey).catch(() => {});
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update action",
    });
  }

  // Clean up replaced files after successful transaction
  if (icon !== undefined && existing.icon)
    await deleteFile(existing.icon).catch(() => {});
  if (modalIcon !== undefined && existing.modalIcon)
    await deleteFile(existing.modalIcon).catch(() => {});

  return { success: true, message: "Action updated" };
};

export const deleteAction = async ({ input }: { input: ActionIdInput }) => {
  const existing = await db.query.action.findFirst({
    where: eq(action.id, input.id),
    columns: { icon: true, modalIcon: true },
  });

  if (!existing)
    throw new ORPCError("NOT_FOUND", { message: "Action not found" });

  const [deleted] = await db
    .delete(action)
    .where(eq(action.id, input.id))
    .returning();

  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Action not found" });

  if (existing.icon) await deleteFile(existing.icon).catch(() => {});
  if (existing.modalIcon) await deleteFile(existing.modalIcon).catch(() => {});

  return { success: true, message: "Action deleted" };
};
