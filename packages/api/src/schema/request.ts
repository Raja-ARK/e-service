import { z } from "zod";

export const createRequestInputSchema = z.object({
  serviceCode: z
    .string()
    .trim()
    .nonempty("Service code is required")
    .nonoptional("Service code is required"),
});

export const createRequestOutputSchema = z.object({});
