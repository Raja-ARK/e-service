import { protectedProcedure, publicProcedure } from "../";
import * as authSchema from "../schema/auth";
import { successResponseSchema } from "../schema/shared";
import * as authServices from "../services/auth";

const signIn = publicProcedure
  .route({
    method: "POST",
    path: "/sign-in",
    summary: "Sign in",
    description: "Sign in to your account",
  })
  .input(authSchema.signInInput)
  .output(authSchema.signInOutput)
  .handler(async ({ input, context }) => {
    return await authServices.signIn({ input, context });
  });

const signUp = publicProcedure
  .route({
    method: "POST",
    path: "/sign-up",
    summary: "Sign up",
    description: "Sign up for a new account",
  })
  .input(authSchema.signUpInputSchema)
  .output(authSchema.signUpOutputSchema)
  .handler(async ({ input, context }) => {
    return await authServices.signUp({ input, context });
  });

const sendVerificationEmail = publicProcedure
  .route({
    method: "POST",
    path: "/send-verification-email",
    summary: "Send Verification Email",
    description: "Send verification email to user",
  })
  .input(authSchema.sendVerificationEmailInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await authServices.sendVerificationEmail({ input, context });
  });

const verifyEmail = publicProcedure
  .route({
    method: "POST",
    path: "/verify-email",
    summary: "Verify Email",
    description: "Verify email address using OTP",
  })
  .input(authSchema.verifyEmailOTPInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await authServices.verifyEmailOtp({ input, context });
  });

const forgetPassword = publicProcedure
  .route({
    method: "POST",
    path: "/forget-password",
    summary: "Forget Password",
    description: "Send OTP to email for password reset",
  })
  .input(authSchema.forgetPasswordInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await authServices.forgetPassword(input);
  });

const changePassword = protectedProcedure
  .route({
    method: "POST",
    path: "/change-password",
    summary: "Change Password",
    description: "Change password for authenticated user",
  })
  .input(authSchema.changePasswordInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await authServices.changePassword({
      input,
      context,
    });
  });

const resetPassword = protectedProcedure
  .route({
    method: "POST",
    path: "/reset-password",
    summary: "Reset Password",
    description: "Reset password using email OTP",
  })
  .input(authSchema.resetPasswordInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await authServices.resetPassword({
      input,
      context,
    });
  });

const signOut = protectedProcedure
  .route({
    method: "POST",
    path: "/sign-out",
    summary: "Sign out",
    description: "Sign out from the current session",
  })
  .output(successResponseSchema)
  .handler(async ({ context }) => {
    return await authServices.signOut({ context });
  });

export const authRouter = publicProcedure.tag("Auth").prefix("/auth").router({
  signIn,
  signUp,
  sendVerificationEmail,
  verifyEmail,
  forgetPassword,
  changePassword,
  resetPassword,
  signOut,
});
