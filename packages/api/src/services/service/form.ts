import { db } from "@e-service/db";
import { and, count, eq, or } from "@e-service/db/drizzle/orm";
import {
  type FieldConfig,
  formField,
  formFieldStage,
  formGroup,
  formGroupStage,
  formRule,
  formStep,
  formStepStage,
  type RuleAction,
} from "@e-service/db/schema/service/form";
import { IMAGE_MIME_TYPES } from "@e-service/shared/utils/constant";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { deleteFile, uploadFile } from "@e-service/storage";
import { generateKey } from "@e-service/storage/utils";
import { ORPCError } from "@orpc/server";
import {
  FIELD_SORT_FIELDS,
  GROUP_SORT_FIELDS,
  RULE_SORT_FIELDS,
  STEP_SORT_FIELDS,
} from "../../schema/service/form";
import type {
  CreateFieldInput,
  CreateGroupInput,
  CreateRuleInput,
  CreateStepInput,
  FieldIdInput,
  GetFormByServiceInput,
  GroupIdInput,
  ListFieldsInput,
  ListGroupsInput,
  ListRulesInput,
  ListStepsInput,
  RuleIdInput,
  StepIdInput,
  UpdateFieldInput,
  UpdateGroupInput,
  UpdateRuleInput,
  UpdateStepInput,
} from "../../types/service/form";
import { buildWhereClause } from "../../utils/filter";
import { buildOrderBy } from "../../utils/sort";

// ---- Shared helpers ----

const stageRefColumns = {
  id: true,
  title: true,
  titleAr: true,
  order: true,
} as const;

const stepWith = {
  stages: { columns: {}, with: { stage: { columns: stageRefColumns } } },
} as const;

const groupWith = {
  stages: { columns: {}, with: { stage: { columns: stageRefColumns } } },
} as const;

const fieldWith = {
  stages: { columns: {}, with: { stage: { columns: stageRefColumns } } },
} as const;

type StageRef = {
  id: string;
  title: string;
  titleAr: string;
  order: number;
};

const flattenStages = <T extends { stages: { stage: StageRef }[] }>(
  row: T,
): Omit<T, "stages"> & { stages: StageRef[] } => {
  const { stages, ...rest } = row;
  return {
    ...rest,
    stages: stages.map((s) => s.stage),
  } as Omit<T, "stages"> & { stages: StageRef[] };
};

const uploadIcon = async (file: File, prefix: string) => {
  const key = generateKey(file, prefix);
  const { data: uploaded } = await tryCatch(
    uploadFile(key, file, {
      contentType: file.type || undefined,
      metadata: { originalName: file.name },
    }),
  );
  return uploaded?.key ?? key;
};

const defaultFieldConfig: FieldConfig = {
  required: false,
  disabled: false,
  minLength: null,
  maxLength: null,
  min: null,
  max: null,
  defaultValue: null,
  allowedFileTypes: IMAGE_MIME_TYPES,
  maxFileSize: 1024 * 1024 * 10,
  maxFileCount: 1,
  fieldWidth: "100%",
  fieldAlignment: "left",
  description: null,
  descriptionAr: null,
  prefixIcon: null,
  suffixIcon: null,
  pattern: null,
  patternMessage: null,
  patternMessageAr: null,
  multiple: null,
};

// ============================================================
// FORM BY SERVICE
// ============================================================

export const getFormByService = async ({
  input,
}: {
  input: GetFormByServiceInput;
}) => {
  const stepWithFull = {
    stages: { columns: {}, with: { stage: { columns: stageRefColumns } } },
    groups: {
      columns: { createdAt: false, updatedAt: false },
      with: {
        stages: {
          columns: {},
          with: { stage: { columns: stageRefColumns } },
        },
        fields: {
          columns: { createdAt: false, updatedAt: false },
          with: {
            stages: {
              columns: {},
              with: { stage: { columns: stageRefColumns } },
            },
          },
        },
      },
    },
    fields: {
      columns: { createdAt: false, updatedAt: false },
      with: {
        stages: {
          columns: {},
          with: { stage: { columns: stageRefColumns } },
        },
      },
    },
  } as const;

  const [stepsRaw, rulesRaw] = await Promise.all([
    db.query.formStep.findMany({
      where: eq(formStep.serviceId, input.serviceId),
      columns: { createdAt: false, updatedAt: false },
      with: stepWithFull,
      orderBy: (s, { asc }) => [asc(s.order)],
    }),
    db.query.formRule.findMany({
      where: eq(formRule.serviceId, input.serviceId),
      columns: { createdAt: false, updatedAt: false },
      orderBy: (r, { asc }) => [asc(r.order)],
    }),
  ]);

  const steps = stepsRaw.map((s) => ({
    ...flattenStages(s),
    groups: s.groups.map((g) => ({
      ...flattenStages(g),
      fields: g.fields.map((f) => flattenStages(f)),
    })),
    fields: s.fields.map((f) => flattenStages(f)),
  }));

  return {
    form: {
      serviceId: input.serviceId,
      steps,
      rules: rulesRaw,
    },
  };
};

// ============================================================
// STEP
// ============================================================

export const listSteps = async ({ input }: { input: ListStepsInput }) => {
  const { page, limit, filter, filterCondition, sort, withoutPagination } =
    input;

  const conditions = filter
    ? [
        buildWhereClause(formStep.serviceId, filter.serviceId),
        buildWhereClause(formStep.code, filter.code),
        buildWhereClause(formStep.title, filter.title),
        buildWhereClause(formStep.titleAr, filter.titleAr),
        buildWhereClause(formStep.type, filter.type),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.formStep.findMany({
      where,
      with: stepWith,
      columns: { createdAt: false, updatedAt: false },
      orderBy: (s) =>
        buildOrderBy(s, sort, STEP_SORT_FIELDS, {
          field: "order",
          direction: "asc",
        }),
    });
    return {
      data: rows.map(flattenStages),
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
    db.query.formStep.findMany({
      where,
      with: stepWith,
      columns: { createdAt: false, updatedAt: false },
      orderBy: (s) =>
        buildOrderBy(s, sort, STEP_SORT_FIELDS, {
          field: "order",
          direction: "asc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(formStep).where(where),
  ]);
  const totalPages = Math.ceil((total?.value ?? 0) / limit);
  return {
    data: rows.map(flattenStages),
    total: total?.value ?? 0,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

export const getStep = async ({ input }: { input: StepIdInput }) => {
  const found = await db.query.formStep.findFirst({
    where: eq(formStep.id, input.id),
    columns: { createdAt: false, updatedAt: false },
    with: stepWith,
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Step not found" });
  return { step: flattenStages(found) };
};

export const createStep = async ({ input }: { input: CreateStepInput }) => {
  const { icon, stageIds, ...stepData } = input;

  let iconKey: string | undefined;
  if (icon) iconKey = await uploadIcon(icon, "form-step");

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(formStep)
        .values({ ...stepData, icon: iconKey ?? null })
        .returning();
      if (!inserted) throw new Error("Failed to create step");

      if (stageIds.length > 0) {
        await tx
          .insert(formStepStage)
          .values(
            stageIds.map((stageId) => ({ stepId: inserted.id, stageId })),
          );
      }
      return inserted;
    }),
  );

  if (error || !result) {
    if (iconKey) await deleteFile(iconKey).catch(() => {});
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create step",
    });
  }

  return await getStep({ input: { id: result.id } });
};

export const updateStep = async ({ input }: { input: UpdateStepInput }) => {
  const { id, icon, stageIds, ...data } = input;

  const existing = await db.query.formStep.findFirst({
    where: eq(formStep.id, id),
    columns: { icon: true },
  });
  if (!existing)
    throw new ORPCError("NOT_FOUND", { message: "Step not found" });

  let newKey: string | undefined;
  if (icon) newKey = await uploadIcon(icon, "form-step");

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [updated] = await tx
        .update(formStep)
        .set({
          ...data,
          ...((newKey !== undefined || icon === null) && {
            icon: icon === null ? null : (newKey ?? null),
          }),
        })
        .where(eq(formStep.id, id))
        .returning();
      if (!updated) throw new Error("Step not found");

      if (stageIds !== undefined) {
        await tx.delete(formStepStage).where(eq(formStepStage.stepId, id));
        if (stageIds.length > 0) {
          await tx
            .insert(formStepStage)
            .values(stageIds.map((stageId) => ({ stepId: id, stageId })));
        }
      }
      return updated;
    }),
  );

  if (error || !result) {
    if (newKey) await deleteFile(newKey).catch(() => {});
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update step",
    });
  }

  if ((newKey || icon === null) && existing.icon) {
    await deleteFile(existing.icon).catch(() => {});
  }

  return await getStep({ input: { id } });
};

export const deleteStep = async ({ input }: { input: StepIdInput }) => {
  const [deleted] = await db
    .delete(formStep)
    .where(eq(formStep.id, input.id))
    .returning();
  if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Step not found" });
  if (deleted.icon) await deleteFile(deleted.icon).catch(() => {});
  return { success: true, message: "Step deleted" };
};

// ============================================================
// GROUP
// ============================================================

export const listGroups = async ({ input }: { input: ListGroupsInput }) => {
  const { page, limit, filter, filterCondition, sort, withoutPagination } =
    input;

  const conditions = filter
    ? [
        buildWhereClause(formGroup.stepId, filter.stepId),
        buildWhereClause(formGroup.label, filter.label),
        buildWhereClause(formGroup.labelAr, filter.labelAr),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.formGroup.findMany({
      where,
      with: groupWith,
      columns: { createdAt: false, updatedAt: false },
      orderBy: (g) =>
        buildOrderBy(g, sort, GROUP_SORT_FIELDS, {
          field: "order",
          direction: "asc",
        }),
    });
    return {
      data: rows.map(flattenStages),
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
    db.query.formGroup.findMany({
      where,
      with: groupWith,
      columns: { createdAt: false, updatedAt: false },
      orderBy: (g) =>
        buildOrderBy(g, sort, GROUP_SORT_FIELDS, {
          field: "order",
          direction: "asc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(formGroup).where(where),
  ]);
  const totalPages = Math.ceil((total?.value ?? 0) / limit);
  return {
    data: rows.map(flattenStages),
    total: total?.value ?? 0,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

export const getGroup = async ({ input }: { input: GroupIdInput }) => {
  const found = await db.query.formGroup.findFirst({
    where: eq(formGroup.id, input.id),
    columns: { createdAt: false, updatedAt: false },
    with: groupWith,
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Group not found" });
  return { group: flattenStages(found) };
};

export const createGroup = async ({ input }: { input: CreateGroupInput }) => {
  const { icon, stageIds, ...groupData } = input;

  let iconKey: string | undefined;
  if (icon) iconKey = await uploadIcon(icon, "form-group");

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(formGroup)
        .values({ ...groupData, icon: iconKey ?? null })
        .returning();
      if (!inserted) throw new Error("Failed to create group");
      if (stageIds.length > 0) {
        await tx
          .insert(formGroupStage)
          .values(
            stageIds.map((stageId) => ({ groupId: inserted.id, stageId })),
          );
      }
      return inserted;
    }),
  );

  if (error || !result) {
    if (iconKey) await deleteFile(iconKey).catch(() => {});
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create group",
    });
  }

  return await getGroup({ input: { id: result.id } });
};

export const updateGroup = async ({ input }: { input: UpdateGroupInput }) => {
  const { id, icon, stageIds, ...data } = input;

  const existing = await db.query.formGroup.findFirst({
    where: eq(formGroup.id, id),
    columns: { icon: true },
  });
  if (!existing)
    throw new ORPCError("NOT_FOUND", { message: "Group not found" });

  let newKey: string | undefined;
  if (icon) newKey = await uploadIcon(icon, "form-group");

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [updated] = await tx
        .update(formGroup)
        .set({
          ...data,
          ...((newKey !== undefined || icon === null) && {
            icon: icon === null ? null : (newKey ?? null),
          }),
        })
        .where(eq(formGroup.id, id))
        .returning();
      if (!updated) throw new Error("Group not found");

      if (stageIds !== undefined) {
        await tx.delete(formGroupStage).where(eq(formGroupStage.groupId, id));
        if (stageIds.length > 0) {
          await tx
            .insert(formGroupStage)
            .values(stageIds.map((stageId) => ({ groupId: id, stageId })));
        }
      }
      return updated;
    }),
  );

  if (error || !result) {
    if (newKey) await deleteFile(newKey).catch(() => {});
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update group",
    });
  }

  if ((newKey || icon === null) && existing.icon) {
    await deleteFile(existing.icon).catch(() => {});
  }

  return await getGroup({ input: { id } });
};

export const deleteGroup = async ({ input }: { input: GroupIdInput }) => {
  const [deleted] = await db
    .delete(formGroup)
    .where(eq(formGroup.id, input.id))
    .returning();
  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Group not found" });
  if (deleted.icon) await deleteFile(deleted.icon).catch(() => {});
  return { success: true, message: "Group deleted" };
};

// ============================================================
// FIELD
// ============================================================

export const listFields = async ({ input }: { input: ListFieldsInput }) => {
  const { page, limit, filter, filterCondition, sort, withoutPagination } =
    input;

  const conditions = filter
    ? [
        buildWhereClause(formField.stepId, filter.stepId),
        buildWhereClause(formField.groupId, filter.groupId),
        buildWhereClause(formField.code, filter.code),
        buildWhereClause(formField.label, filter.label),
        buildWhereClause(formField.type, filter.type),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.formField.findMany({
      where,
      with: fieldWith,
      columns: { createdAt: false, updatedAt: false },
      orderBy: (f) =>
        buildOrderBy(f, sort, FIELD_SORT_FIELDS, {
          field: "order",
          direction: "asc",
        }),
    });
    return {
      data: rows.map(flattenStages),
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
    db.query.formField.findMany({
      where,
      with: fieldWith,
      columns: { createdAt: false, updatedAt: false },
      orderBy: (f) =>
        buildOrderBy(f, sort, FIELD_SORT_FIELDS, {
          field: "order",
          direction: "asc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(formField).where(where),
  ]);
  const totalPages = Math.ceil((total?.value ?? 0) / limit);
  return {
    data: rows.map(flattenStages),
    total: total?.value ?? 0,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

export const getField = async ({ input }: { input: FieldIdInput }) => {
  const found = await db.query.formField.findFirst({
    where: eq(formField.id, input.id),
    columns: { createdAt: false, updatedAt: false },
    with: fieldWith,
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Field not found" });
  return { field: flattenStages(found) };
};

export const createField = async ({ input }: { input: CreateFieldInput }) => {
  const { prefixIcon, suffixIcon, stageIds, config, ...fieldData } = input;

  let prefixKey: string | undefined;
  let suffixKey: string | undefined;
  if (prefixIcon) prefixKey = await uploadIcon(prefixIcon, "form-field-icon");
  if (suffixIcon) suffixKey = await uploadIcon(suffixIcon, "form-field-icon");

  const mergedConfig: FieldConfig = {
    ...defaultFieldConfig,
    ...(config ?? {}),
    prefixIcon: prefixKey ?? null,
    suffixIcon: suffixKey ?? null,
  };

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(formField)
        .values({ ...fieldData, config: mergedConfig })
        .returning();
      if (!inserted) throw new Error("Failed to create field");
      if (stageIds.length > 0) {
        await tx
          .insert(formFieldStage)
          .values(
            stageIds.map((stageId) => ({ fieldId: inserted.id, stageId })),
          );
      }
      return inserted;
    }),
  );

  if (error || !result) {
    if (prefixKey) await deleteFile(prefixKey).catch(() => {});
    if (suffixKey) await deleteFile(suffixKey).catch(() => {});
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create field",
    });
  }

  return await getField({ input: { id: result.id } });
};

export const updateField = async ({ input }: { input: UpdateFieldInput }) => {
  const { id, prefixIcon, suffixIcon, stageIds, config, ...data } = input;

  const existing = await db.query.formField.findFirst({
    where: eq(formField.id, id),
    columns: { config: true },
  });
  if (!existing)
    throw new ORPCError("NOT_FOUND", { message: "Field not found" });

  const oldConfig = existing.config ?? defaultFieldConfig;

  let prefixKey: string | undefined;
  let suffixKey: string | undefined;
  if (prefixIcon) prefixKey = await uploadIcon(prefixIcon, "form-field-icon");
  if (suffixIcon) suffixKey = await uploadIcon(suffixIcon, "form-field-icon");

  const nextConfig: FieldConfig = {
    ...oldConfig,
    ...(config ?? {}),
    prefixIcon:
      prefixIcon === null ? null : (prefixKey ?? oldConfig.prefixIcon ?? null),
    suffixIcon:
      suffixIcon === null ? null : (suffixKey ?? oldConfig.suffixIcon ?? null),
  };

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [updated] = await tx
        .update(formField)
        .set({ ...data, config: nextConfig })
        .where(eq(formField.id, id))
        .returning();
      if (!updated) throw new Error("Field not found");

      if (stageIds !== undefined) {
        await tx.delete(formFieldStage).where(eq(formFieldStage.fieldId, id));
        if (stageIds.length > 0) {
          await tx
            .insert(formFieldStage)
            .values(stageIds.map((stageId) => ({ fieldId: id, stageId })));
        }
      }
      return updated;
    }),
  );

  if (error || !result) {
    if (prefixKey) await deleteFile(prefixKey).catch(() => {});
    if (suffixKey) await deleteFile(suffixKey).catch(() => {});
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update field",
    });
  }

  if ((prefixKey || prefixIcon === null) && oldConfig.prefixIcon) {
    await deleteFile(oldConfig.prefixIcon).catch(() => {});
  }
  if ((suffixKey || suffixIcon === null) && oldConfig.suffixIcon) {
    await deleteFile(oldConfig.suffixIcon).catch(() => {});
  }

  return await getField({ input: { id } });
};

export const deleteField = async ({ input }: { input: FieldIdInput }) => {
  const [deleted] = await db
    .delete(formField)
    .where(eq(formField.id, input.id))
    .returning();
  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Field not found" });
  const cfg = deleted.config;
  if (cfg?.prefixIcon) await deleteFile(cfg.prefixIcon).catch(() => {});
  if (cfg?.suffixIcon) await deleteFile(cfg.suffixIcon).catch(() => {});
  return { success: true, message: "Field deleted" };
};

// ============================================================
// RULE
// ============================================================

export const listRules = async ({ input }: { input: ListRulesInput }) => {
  const { page, limit, filter, filterCondition, sort, withoutPagination } =
    input;

  const conditions = filter
    ? [
        buildWhereClause(formRule.serviceId, filter.serviceId),
        buildWhereClause(formRule.trigger, filter.trigger),
        buildWhereClause(formRule.sourceFieldId, filter.sourceFieldId),
        buildWhereClause(formRule.stepId, filter.stepId),
        buildWhereClause(formRule.isActive, filter.isActive),
      ].filter(Boolean)
    : [];

  const where =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  if (withoutPagination) {
    const rows = await db.query.formRule.findMany({
      where,
      columns: { createdAt: false, updatedAt: false },
      orderBy: (r) =>
        buildOrderBy(r, sort, RULE_SORT_FIELDS, {
          field: "order",
          direction: "asc",
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
    db.query.formRule.findMany({
      where,
      columns: { createdAt: false, updatedAt: false },
      orderBy: (r) =>
        buildOrderBy(r, sort, RULE_SORT_FIELDS, {
          field: "order",
          direction: "asc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(formRule).where(where),
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

export const getRule = async ({ input }: { input: RuleIdInput }) => {
  const found = await db.query.formRule.findFirst({
    where: eq(formRule.id, input.id),
    columns: { createdAt: false, updatedAt: false },
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
  return { rule: found };
};

export const createRule = async ({ input }: { input: CreateRuleInput }) => {
  const { data: created, error } = await tryCatch(
    db
      .insert(formRule)
      .values({ ...input, actions: input.actions as RuleAction[] })
      .returning(),
  );
  const row = created?.[0];
  if (error || !row) {
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create rule",
    });
  }
  return await getRule({ input: { id: row.id } });
};

export const updateRule = async ({ input }: { input: UpdateRuleInput }) => {
  const { id, actions, ...data } = input;
  const { data: updated, error } = await tryCatch(
    db
      .update(formRule)
      .set({
        ...data,
        ...(actions !== undefined && { actions: actions as RuleAction[] }),
      })
      .where(eq(formRule.id, id))
      .returning(),
  );
  const row = updated?.[0];
  if (error || !row) {
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update rule",
    });
  }
  return await getRule({ input: { id } });
};

export const deleteRule = async ({ input }: { input: RuleIdInput }) => {
  const [deleted] = await db
    .delete(formRule)
    .where(eq(formRule.id, input.id))
    .returning();
  if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
  return { success: true, message: "Rule deleted" };
};
