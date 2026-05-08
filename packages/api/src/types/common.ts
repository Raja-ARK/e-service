import type z from "zod";
import type { successResponseSchema } from "../schema/common";

export type SuccessResponse = z.infer<typeof successResponseSchema>;
