import { protectedProcedure, publicProcedure } from "../";
import * as authSchema from "../schema/auth";
import { successResponseSchema } from "../schema/common";
import * as authServices from "../services/auth";

const signIn = publicProcedure
  .route({
    method: "POST",
    path: "/sign-in",
    summary: "Sign in - /sign-in",
    description: "Sign in to your account",
    tags: ["Auth"],
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
    summary: "Sign up - /sign-up",
    description: "Sign up for a new account",
    tags: ["Auth"],
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
    summary: "Send Verification Email - /send-verification-email",
    description: "Send verification email to user",
    tags: ["Auth"],
  })
  .input(authSchema.sendVerificationEmailInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await authServices.sendVerificationEmail({ input, context });
  });

const verifyEmail = protectedProcedure
  .route({
    method: "POST",
    path: "/verify-email",
    summary: "Verify Email - /verify-email",
    description: "Verify email address using OTP",
    tags: ["Auth"],
  })
  .input(authSchema.verifyEmailOTPInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await authServices.verifyEmailOtp(input);
  });

const forgetPassword = publicProcedure
  .route({
    method: "POST",
    path: "/forget-password",
    summary: "Forget Password - /forget-password",
    description: "Send OTP to email for password reset",
    tags: ["Auth"],
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
    summary: "Change Password - /change-password",
    description: "Change password for authenticated user",
    tags: ["Auth"],
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
    summary: "Reset Password - /reset-password",
    description: "Reset password using email OTP",
    tags: ["Auth"],
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
    summary: "Sign out - /sign-out",
    description: "Sign out from the current session",
    tags: ["Auth"],
  })
  .output(successResponseSchema)
  .handler(async ({ context }) => {
    return await authServices.signOut({ context });
  });

const getUser = protectedProcedure
  .route({
    method: "GET",
    path: "/get-user",
    summary: "Get User - /get-user",
    description: "Get user from the current session",
    tags: ["Auth"],
  })
  .output(authSchema.getUserOutputSchema)
  .handler(async ({ context }) => {
    return await authServices.getUser({ context });
  });

export const authRouter = {
  signIn,
  signUp,
  sendVerificationEmail,
  verifyEmail,
  forgetPassword,
  changePassword,
  resetPassword,
  signOut,
  getUser,
};
