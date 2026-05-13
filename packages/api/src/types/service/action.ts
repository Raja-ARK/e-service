import type z from "zod";
import type {
  actionIdSchema,
  createActionInputSchema,
  listActionsInputSchema,
  updateActionInputSchema,
} from "../../schema/service/action";

export type ActionIdInput = z.infer<typeof actionIdSchema>;
export type CreateActionInput = z.infer<typeof createActionInputSchema>;
export type UpdateActionInput = z.infer<typeof updateActionInputSchema>;
export type ListActionsInput = z.infer<typeof listActionsInputSchema>;
