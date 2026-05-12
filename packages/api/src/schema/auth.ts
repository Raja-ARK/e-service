import { createInsertSchema } from "@e-service/db/drizzle-zod";
import { user } from "@e-service/db/schema/auth";
import { userSchema } from "@e-service/db/zod-schemas/auth";
import { emailSchema, passwordSchema } from "@e-service/shared/schema";
import { ARABIC_NAME_REGEX } from "@e-service/shared/utils/constant";
import { z } from "zod";

export const signInInput = z.object({
  email: emailSchema.transform((email) => email.toLowerCase()),
  password: passwordSchema,
});

export const signInOutput = z.object({
  user: userSchema,
  token: z.string(),
});

export const signUpInputSchema = createInsertSchema(user, {
  nameAr: z
    .string()
    .check(({ issues, value }) => {
      if (value && value?.trim() !== "" && !ARABIC_NAME_REGEX.test(value)) {
        issues.push({
          code: "custom",
          message: "Invalid Arabic name",
          input: value,
        });
        return;
      }
    })
    .nullish(),
  email: emailSchema.transform((email) => email.toLowerCase()),
  name: z.string().check(({ issues, value }) => {
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

    if (value.length > 50) {
      issues.push({
        code: "custom",
        message: "Name must be less than 50 characters long",
        input: value,
      });
      return;
    }
  }),
})
  .omit({
    createdAt: true,
    updatedAt: true,
    id: true,
    banExpires: true,
    banReason: true,
    banned: true,
    role: true,
    emailVerified: true,
    image: true,
    currency: true,
    dateFormat: true,
    dateTimeFormat: true,
    itemsPerPage: true,
    timeFormat: true,
    hourFormat: true,
    defaultTheme: true,
    timezone: true,
    language: true,
    nationality: true,
    emirateId: true,
    gender: true,
    dob: true,
  })
  .and(
    z.object({
      password: passwordSchema,
    }),
  );

export const signUpOutputSchema = z.object({
  user: userSchema,
  token: z.string().optional().nullable(),
});

export const verifyEmailOTPInputSchema = z.object({
  email: emailSchema.transform((email) => email.toLowerCase()),
  otp: z.string().length(6),
});

export const forgetPasswordInputSchema = z.object({
  email: emailSchema.transform((email) => email.toLowerCase()),
});

export const changePasswordInputSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .check(({ issues, value }) => {
    if (value.currentPassword === value.newPassword) {
      issues.push({
        code: "custom",
        message: "New password cannot be the same as current password",
        input: value,
        path: ["newPassword"],
      });
    }
  });

export const resetPasswordInputSchema = z.object({
  email: emailSchema.transform((email) => email.toLowerCase()),
  otp: z.string().length(6),
  password: passwordSchema,
});

export const sendVerificationEmailInputSchema = z.object({
  email: emailSchema.transform((email) => email.toLowerCase()),
  type: z.enum(["email-verification", "forget-password", "sign-in"]),
});

export const getUserOutputSchema = z.object({
  user: userSchema,
});
