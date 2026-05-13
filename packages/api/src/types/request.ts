import type z from "zod";
import type { createRequestInputSchema } from "../schema/request";

export type CreateRequestInput = z.infer<typeof createRequestInputSchema>;
