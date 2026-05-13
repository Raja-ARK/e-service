import type { z } from "zod";
import type {
  createPrerequisiteInputSchema,
  getPrerequisiteInputSchema,
  listPrerequisitesInputSchema,
  prerequisiteIdSchema,
  updatePrerequisiteInputSchema,
} from "../../schema/service/prerequisite";

export type PrerequisiteIdInput = z.infer<typeof prerequisiteIdSchema>;
export type GetPrerequisiteInput = z.infer<typeof getPrerequisiteInputSchema>;
export type CreatePrerequisiteInput = z.infer<
  typeof createPrerequisiteInputSchema
>;
export type UpdatePrerequisiteInput = z.infer<
  typeof updatePrerequisiteInputSchema
>;
export type ListPrerequisitesInput = z.infer<
  typeof listPrerequisitesInputSchema
>;
