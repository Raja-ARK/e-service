import type { z } from "zod";
import type {
  createFieldInputSchema,
  createGroupInputSchema,
  createRuleInputSchema,
  createStepInputSchema,
  fieldIdSchema,
  getFormByServiceInputSchema,
  groupIdSchema,
  listFieldsInputSchema,
  listGroupsInputSchema,
  listRulesInputSchema,
  listStepsInputSchema,
  ruleIdSchema,
  stepIdSchema,
  updateFieldInputSchema,
  updateGroupInputSchema,
  updateRuleInputSchema,
  updateStepInputSchema,
} from "../../schema/service/form";

export type GetFormByServiceInput = z.infer<typeof getFormByServiceInputSchema>;

export type StepIdInput = z.infer<typeof stepIdSchema>;
export type CreateStepInput = z.infer<typeof createStepInputSchema>;
export type UpdateStepInput = z.infer<typeof updateStepInputSchema>;
export type ListStepsInput = z.infer<typeof listStepsInputSchema>;

export type GroupIdInput = z.infer<typeof groupIdSchema>;
export type CreateGroupInput = z.infer<typeof createGroupInputSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupInputSchema>;
export type ListGroupsInput = z.infer<typeof listGroupsInputSchema>;

export type FieldIdInput = z.infer<typeof fieldIdSchema>;
export type CreateFieldInput = z.infer<typeof createFieldInputSchema>;
export type UpdateFieldInput = z.infer<typeof updateFieldInputSchema>;
export type ListFieldsInput = z.infer<typeof listFieldsInputSchema>;

export type RuleIdInput = z.infer<typeof ruleIdSchema>;
export type CreateRuleInput = z.infer<typeof createRuleInputSchema>;
export type UpdateRuleInput = z.infer<typeof updateRuleInputSchema>;
export type ListRulesInput = z.infer<typeof listRulesInputSchema>;
