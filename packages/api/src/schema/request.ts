import { z } from "zod";
import { categorySchema } from "./shared";

export const createRequestInputSchema = z
  .object({
    serviceId: z
      .uuid({
        error: ({ code }) => {
          if (code === "invalid_type") {
            return {
              message: "Service id is required",
            };
          }
          if (code === "invalid_format") {
            return {
              message: "Invalid service id",
            };
          }
        },
      })
      .trim()
      .nonempty("Service id is required"),
    category: categorySchema,
    formData: z.record(z.string(), z.unknown()),
    companyId: z
      .uuid({
        error: ({ code }) => {
          if (code === "invalid_type") {
            return {
              message: "Company id is required",
            };
          }
        },
      })
      .trim()
      .nonempty("Company id is required")
      .nullish(),
  })
  .check(({ issues, value }) => {
    if (!value.companyId && value.category === "corporate") {
      issues.push({
        code: "custom",
        message: "Company id is required",
        input: value,
      });
    }
  });

export const requestOutputSchema = z.object({
  requestNo: z.string(),
  isPaymentStage: z.boolean().optional(),
});

export const updateRequestInputSchema = z.object({
  requestNo: z.string(),
  formData: z.record(z.string(), z.unknown()),
  actionId: z
    .uuid({
      error: ({ code }) => {
        if (code === "invalid_type") {
          return {
            message: "Action id is required",
          };
        }
      },
    })
    .trim()
    .nonempty("Action id is required"),
});
