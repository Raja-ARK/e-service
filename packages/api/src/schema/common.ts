import z from "zod";

export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
