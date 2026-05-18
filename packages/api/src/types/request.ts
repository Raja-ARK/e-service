import type z from "zod";
import type {
  createRequestInputSchema,
  updateRequestInputSchema,
} from "../schema/request";

export type CreateRequestInput = z.infer<typeof createRequestInputSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestInputSchema>;
