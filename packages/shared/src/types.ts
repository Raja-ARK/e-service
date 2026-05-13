import type z from "zod";
import type { serviceCompletionStatusSchema } from "./schema";

export type ServiceCompletionStatus = z.infer<
  typeof serviceCompletionStatusSchema
>;
