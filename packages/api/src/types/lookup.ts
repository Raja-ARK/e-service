import type { z } from "zod";
import type {
  bulkCreateLookupOptionsSchema,
  bulkDeleteLookupOptionsSchema,
  bulkUpdateLookupOptionsSchema,
  createLookupOptionSchema,
  getLookupOptionInputSchema,
  listLookupOptionsInputSchema,
  lookupIdSchema,
  updateLookupOptionSchema,
} from "../schema/lookup";

export type LookupIdInput = z.infer<typeof lookupIdSchema>;
export type GetLookupOptionInput = z.infer<typeof getLookupOptionInputSchema>;
export type CreateLookupOptionInput = z.infer<typeof createLookupOptionSchema>;
export type UpdateLookupOptionInput = z.infer<typeof updateLookupOptionSchema>;
export type ListLookupOptionsInput = z.infer<
  typeof listLookupOptionsInputSchema
>;
export type BulkCreateLookupOptionsInput = z.infer<
  typeof bulkCreateLookupOptionsSchema
>;
export type BulkUpdateLookupOptionsInput = z.infer<
  typeof bulkUpdateLookupOptionsSchema
>;
export type BulkDeleteLookupOptionsInput = z.infer<
  typeof bulkDeleteLookupOptionsSchema
>;
