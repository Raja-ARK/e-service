import type z from "zod";
import type {
  changePasswordInputSchema,
  forgetPasswordInputSchema,
  resetPasswordInputSchema,
  sendVerificationEmailInputSchema,
  signInInput,
  signInOutput,
  signUpInputSchema,
  signUpOutputSchema,
  verifyEmailOTPInputSchema,
} from "../schema/auth";

export type SignInInput = z.infer<typeof signInInput>;
export type SignInOutput = z.infer<typeof signInOutput>;

export type SignUpInput = z.infer<typeof signUpInputSchema>;
export type SignUpOutput = z.infer<typeof signUpOutputSchema>;

export type SendVerificationEmailInput = z.infer<
  typeof sendVerificationEmailInputSchema
>;
export type VerifyEmailOTPInput = z.infer<typeof verifyEmailOTPInputSchema>;
export type ForgetPasswordInput = z.infer<typeof forgetPasswordInputSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
