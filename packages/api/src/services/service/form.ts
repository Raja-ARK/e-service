import { db } from "@e-service/db";
import { eq } from "@e-service/db/drizzle/orm";
import type {
  FieldConfig,
  RuleAction,
  VisibilityCondition,
} from "@e-service/db/schema/service/form";
import {
  form,
  formField,
  formFieldStage,
  formGroup,
  formGroupStage,
  formRule,
  formStep,
  formStepStage,
} from "@e-service/db/schema/service/form";
import { tryCatch } from "@e-service/shared/utils/try-catch";
import { ORPCError } from "@orpc/server";
import type {
  CreateFormFieldInput,
  CreateFormGroupInput,
  CreateFormInput,
  CreateFormRuleInput,
  CreateFormStepInput,
  FormFieldIdInput,
  FormGroupIdInput,
  FormIdInput,
  FormRuleIdInput,
  FormStepIdInput,
  GetFormByServiceIdInput,
  UpdateFormFieldInput,
  UpdateFormGroupInput,
  UpdateFormInput,
  UpdateFormRuleInput,
  UpdateFormStepInput,
} from "../../types/service/form";

// ─── Form ─────────────────────────────────────────────────────────────────────

export const getFormByServiceId = async ({
  input,
}: {
  input: GetFormByServiceIdInput;
}) => {
  const found = await db.query.form.findFirst({
    where: eq(form.serviceId, input.serviceId),
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Form not found" });
  return { form: found };
};

export const getForm = async ({ input }: { input: FormIdInput }) => {
  const found = await db.query.form.findFirst({
    where: eq(form.id, input.id),
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Form not found" });
  return { form: found };
};

export const createForm = async ({ input }: { input: CreateFormInput }) => {
  const { data: created, error } = await tryCatch(
    db.insert(form).values(input).returning(),
  );
  const newForm = created?.[0];
  if (error || !newForm) {
    const msg = error?.message ?? "";
    throw new ORPCError(msg.includes("unique") ? "CONFLICT" : "BAD_REQUEST", {
      message: msg.includes("unique")
        ? "A form for this service already exists"
        : msg || "Failed to create form",
    });
  }
  return { form: newForm };
};

export const updateForm = async ({ input }: { input: UpdateFormInput }) => {
  const { id, ...data } = input;
  const { data: updated, error } = await tryCatch(
    db.update(form).set(data).where(eq(form.id, id)).returning(),
  );
  const updatedForm = updated?.[0];
  if (error || !updatedForm) {
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update form",
    });
  }
  return { form: updatedForm };
};

export const deleteForm = async ({ input }: { input: FormIdInput }) => {
  const [deleted] = await db
    .delete(form)
    .where(eq(form.id, input.id))
    .returning();
  if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Form not found" });
  return { success: true, message: "Form deleted" };
};

// ─── FormStep ─────────────────────────────────────────────────────────────────

export const getFormStep = async ({ input }: { input: FormStepIdInput }) => {
  const found = await db.query.formStep.findFirst({
    where: eq(formStep.id, input.id),
    with: { stages: true },
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Step not found" });
  return { step: found };
};

export const createFormStep = async ({
  input,
}: {
  input: CreateFormStepInput;
}) => {
  const { stageIds, visibilityCondition, ...stepData } = input;

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [newStep] = await tx
        .insert(formStep)
        .values({
          ...stepData,
          visibilityCondition: visibilityCondition as
            | VisibilityCondition
            | undefined,
        })
        .returning();

      if (!newStep) throw new Error("Failed to create step");

      if (stageIds.length > 0) {
        await tx
          .insert(formStepStage)
          .values(stageIds.map((stageId) => ({ stepId: newStep.id, stageId })));
      }

      return newStep;
    }),
  );

  if (error || !result)
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create step",
    });

  return { step: result };
};

export const updateFormStep = async ({
  input,
}: {
  input: UpdateFormStepInput;
}) => {
  const { id, stageIds, visibilityCondition, ...data } = input;

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [updated] = await tx
        .update(formStep)
        .set({
          ...data,
          ...(visibilityCondition !== undefined && {
            visibilityCondition: visibilityCondition as
              | VisibilityCondition
              | undefined,
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

  if (error || !result)
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update step",
    });

  return { step: result };
};

export const deleteFormStep = async ({ input }: { input: FormStepIdInput }) => {
  const [deleted] = await db
    .delete(formStep)
    .where(eq(formStep.id, input.id))
    .returning();
  if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Step not found" });
  return { success: true, message: "Step deleted" };
};

// ─── FormGroup ────────────────────────────────────────────────────────────────

export const getFormGroup = async ({ input }: { input: FormGroupIdInput }) => {
  const found = await db.query.formGroup.findFirst({
    where: eq(formGroup.id, input.id),
    with: { stages: true },
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Group not found" });
  return { group: found };
};

export const createFormGroup = async ({
  input,
}: {
  input: CreateFormGroupInput;
}) => {
  const { stageIds, visibilityCondition, ...groupData } = input;

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [newGroup] = await tx
        .insert(formGroup)
        .values({
          ...groupData,
          visibilityCondition: visibilityCondition as
            | VisibilityCondition
            | undefined,
        })
        .returning();

      if (!newGroup) throw new Error("Failed to create group");

      if (stageIds.length > 0) {
        await tx
          .insert(formGroupStage)
          .values(
            stageIds.map((stageId) => ({ groupId: newGroup.id, stageId })),
          );
      }

      return newGroup;
    }),
  );

  if (error || !result)
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create group",
    });

  return { group: result };
};

export const updateFormGroup = async ({
  input,
}: {
  input: UpdateFormGroupInput;
}) => {
  const { id, stageIds, visibilityCondition, ...data } = input;

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [updated] = await tx
        .update(formGroup)
        .set({
          ...data,
          ...(visibilityCondition !== undefined && {
            visibilityCondition: visibilityCondition as
              | VisibilityCondition
              | undefined,
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

  if (error || !result)
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update group",
    });

  return { group: result };
};

export const deleteFormGroup = async ({
  input,
}: {
  input: FormGroupIdInput;
}) => {
  const [deleted] = await db
    .delete(formGroup)
    .where(eq(formGroup.id, input.id))
    .returning();
  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Group not found" });
  return { success: true, message: "Group deleted" };
};

// ─── FormField ────────────────────────────────────────────────────────────────

export const getFormField = async ({ input }: { input: FormFieldIdInput }) => {
  const found = await db.query.formField.findFirst({
    where: eq(formField.id, input.id),
    with: { stages: true },
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Field not found" });
  return { field: found };
};

export const createFormField = async ({
  input,
}: {
  input: CreateFormFieldInput;
}) => {
  const { stageIds, visibilityCondition, config, ...fieldData } = input;

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [newField] = await tx
        .insert(formField)
        .values({
          ...fieldData,
          visibilityCondition: visibilityCondition as
            | VisibilityCondition
            | undefined,
          config: config as FieldConfig,
        })
        .returning();

      if (!newField) throw new Error("Failed to create field");

      if (stageIds.length > 0) {
        await tx
          .insert(formFieldStage)
          .values(
            stageIds.map((stageId) => ({ fieldId: newField.id, stageId })),
          );
      }

      return newField;
    }),
  );

  if (error || !result)
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create field",
    });

  return { field: result };
};

export const updateFormField = async ({
  input,
}: {
  input: UpdateFormFieldInput;
}) => {
  const { id, stageIds, visibilityCondition, config, ...data } = input;

  const { data: result, error } = await tryCatch(
    db.transaction(async (tx) => {
      const [updated] = await tx
        .update(formField)
        .set({
          ...data,
          ...(visibilityCondition !== undefined && {
            visibilityCondition: visibilityCondition as
              | VisibilityCondition
              | undefined,
          }),
          ...(config !== undefined && { config: config as FieldConfig }),
        })
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

  if (error || !result)
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update field",
    });

  return { field: result };
};

export const deleteFormField = async ({
  input,
}: {
  input: FormFieldIdInput;
}) => {
  const [deleted] = await db
    .delete(formField)
    .where(eq(formField.id, input.id))
    .returning();
  if (!deleted)
    throw new ORPCError("NOT_FOUND", { message: "Field not found" });
  return { success: true, message: "Field deleted" };
};

// ─── FormRule ─────────────────────────────────────────────────────────────────

export const getFormRule = async ({ input }: { input: FormRuleIdInput }) => {
  const found = await db.query.formRule.findFirst({
    where: eq(formRule.id, input.id),
  });
  if (!found) throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
  return { rule: found };
};

export const createFormRule = async ({
  input,
}: {
  input: CreateFormRuleInput;
}) => {
  const { condition, actions, ...ruleData } = input;

  const { data: created, error } = await tryCatch(
    db
      .insert(formRule)
      .values({
        ...ruleData,
        condition: condition as VisibilityCondition | undefined,
        actions: (actions ?? []) as RuleAction[],
      })
      .returning(),
  );

  const newRule = created?.[0];
  if (error || !newRule)
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to create rule",
    });

  return { rule: newRule };
};

export const updateFormRule = async ({
  input,
}: {
  input: UpdateFormRuleInput;
}) => {
  const { id, condition, actions, ...data } = input;

  const { data: updated, error } = await tryCatch(
    db
      .update(formRule)
      .set({
        ...data,
        ...(condition !== undefined && {
          condition: condition as VisibilityCondition | undefined,
        }),
        ...(actions !== undefined && { actions: actions as RuleAction[] }),
      })
      .where(eq(formRule.id, id))
      .returning(),
  );

  const updatedRule = updated?.[0];
  if (error || !updatedRule)
    throw new ORPCError("BAD_REQUEST", {
      message: error?.message ?? "Failed to update rule",
    });

  return { rule: updatedRule };
};

export const deleteFormRule = async ({ input }: { input: FormRuleIdInput }) => {
  const [deleted] = await db
    .delete(formRule)
    .where(eq(formRule.id, input.id))
    .returning();
  if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
  return { success: true, message: "Rule deleted" };
};
