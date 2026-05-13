import type { z } from "zod";
import type {
  createStageInputSchema,
  listStagesInputSchema,
  stageIdSchema,
  updateStageInputSchema,
} from "../../schema/service/stage";

export type StageIdInput = z.infer<typeof stageIdSchema>;
export type CreateStageInput = z.infer<typeof createStageInputSchema>;
export type UpdateStageInput = z.infer<typeof updateStageInputSchema>;
export type ListStagesInput = z.infer<typeof listStagesInputSchema>;
