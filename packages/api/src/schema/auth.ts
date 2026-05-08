import { createInsertSchema } from "@e-service/db/drizzle-zod";
import { user } from "@e-service/db/schema/auth";
import { userSchema } from "@e-service/db/zod-schemas/auth";
import {
  arabicNameSchema,
  dateCodecSchema,
  emailSchema,
  passwordSchema,
} from "@e-service/shared/schema";
import { z } from "zod";

export const signInInput = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signInOutput = z.object({
  token: z.string(),
  user: userSchema,
});

export const signUpInputSchema = createInsertSchema(user)
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
  })
  .extend({
    dob: dateCodecSchema.nullish(),
  })
  .and(
    z.object({
      password: passwordSchema,
      nameAr: arabicNameSchema.nullish(),
    }),
  );

export const signUpOutputSchema = z.object({
  user: userSchema,
});

export const verifyEmailOTPInputSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6),
});

export const forgetPasswordInputSchema = z.object({
  email: emailSchema,
});

export const changePasswordInputSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export const resetPasswordInputSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6),
  password: passwordSchema,
});

export const sendVerificationEmailInputSchema = z.object({
  email: emailSchema,
  type: z.enum(["email-verification", "forget-password", "sign-in"]),
});
