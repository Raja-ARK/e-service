import { createInsertSchema } from "@e-service/db/drizzle/zod";
import { service } from "@e-service/db/schema/service/service";
import { ARABIC_NAME_REGEX } from "@e-service/shared/utils/constant";
import z from "zod";

const nameSchema = z.string().check(({ issues, value }) => {
  if (value === null || value === undefined || value?.trim() === "") {
    issues.push({
      code: "custom",
      message: "Name is required",
      input: value,
    });
    return;
  }

  if (value.length < 2) {
    issues.push({
      code: "custom",
      message: "Name must be at least 2 characters long",
      input: value,
    });
    return;
  }

  if (value.length > 250) {
    issues.push({
      code: "custom",
      message: "Name must be less than 250 characters long",
      input: value,
    });
    return;
  }
});

const nameArSchema = z
  .string({
    error: ({ code }) => {
      if (code === "invalid_type") {
        return {
          message: "Arabic name is required",
        };
      }
    },
  })
  .trim()
  .trim()
  .nonempty("Arabic name is required")
  .check(({ issues, value }) => {
    if (value && value?.trim() !== "" && !ARABIC_NAME_REGEX.test(value)) {
      issues.push({
        code: "custom",
        message: "Invalid Arabic name",
        input: value,
      });
      return;
    }

    if (value.length < 2) {
      issues.push({
        code: "custom",
        message: "Arabic name must be at least 2 characters long",
        input: value,
      });
      return;
    }
    if (value.length > 250) {
      issues.push({
        code: "custom",
        message: "Arabic name must be less than 250 characters long",
        input: value,
      });
      return;
    }
  });

export const serviceCreateInputSchema = createInsertSchema(service, {
  logo: z.file().mime("image/*"),
  name: nameSchema,
  nameAr: nameArSchema,
  description: z
    .string()
    .trim()
    .nonempty("Description is required")
    .nonoptional("Description is required"),
  descriptionAr: z
    .string()
    .regex(ARABIC_NAME_REGEX, "Invalid Arabic description")
    .trim()
    .nonempty("Arabic description is required")
    .nonoptional("Arabic description is required"),
  serviceCode: z
    .string()
    .trim()
    .nonempty("Service code is required")
    .nonoptional("Service code is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});
