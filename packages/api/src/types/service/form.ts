import type { z } from "zod";
import type {
  createFormFieldInputSchema,
  createFormGroupInputSchema,
  createFormInputSchema,
  createFormRuleInputSchema,
  createFormStepInputSchema,
  formFieldIdSchema,
  formGroupIdSchema,
  formIdSchema,
  formRuleIdSchema,
  formStepIdSchema,
  getFormByServiceIdSchema,
  updateFormFieldInputSchema,
  updateFormGroupInputSchema,
  updateFormInputSchema,
  updateFormRuleInputSchema,
  updateFormStepInputSchema,
} from "../../schema/service/form";

export type FormIdInput = z.infer<typeof formIdSchema>;
export type GetFormByServiceIdInput = z.infer<typeof getFormByServiceIdSchema>;
export type CreateFormInput = z.infer<typeof createFormInputSchema>;
export type UpdateFormInput = z.infer<typeof updateFormInputSchema>;

export type FormStepIdInput = z.infer<typeof formStepIdSchema>;
export type CreateFormStepInput = z.infer<typeof createFormStepInputSchema>;
export type UpdateFormStepInput = z.infer<typeof updateFormStepInputSchema>;

export type FormGroupIdInput = z.infer<typeof formGroupIdSchema>;
export type CreateFormGroupInput = z.infer<typeof createFormGroupInputSchema>;
export type UpdateFormGroupInput = z.infer<typeof updateFormGroupInputSchema>;

export type FormFieldIdInput = z.infer<typeof formFieldIdSchema>;
export type CreateFormFieldInput = z.infer<typeof createFormFieldInputSchema>;
export type UpdateFormFieldInput = z.infer<typeof updateFormFieldInputSchema>;

export type FormRuleIdInput = z.infer<typeof formRuleIdSchema>;
export type CreateFormRuleInput = z.infer<typeof createFormRuleInputSchema>;
export type UpdateFormRuleInput = z.infer<typeof updateFormRuleInputSchema>;
