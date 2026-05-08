import { auth } from "@e-service/auth";
import { db } from "@e-service/db";
import { eq } from "@e-service/db/drizzle/orm";
import { user } from "@e-service/db/schema/auth";
import { professional } from "@e-service/db/schema/professional";
import type { User } from "@e-service/db/zod-schemas/auth";
import type { Context } from "../context";
import type {
  ChangePasswordInput,
  ForgetPasswordInput,
  ResetPasswordInput,
  SendVerificationEmailInput,
  SignInInput,
  SignUpInput,
  VerifyEmailOTPInput,
} from "../types/auth";
import { SIGNUP_ALLOWED_ORIGINS } from "../utils/constant";
import { createError } from "../utils/error";

export const signIn = async ({
  input,
  context,
}: {
  input: SignInInput;
  context: Context;
}) => {
  const userRole = await db.query.user.findFirst({
    where: eq(user.email, input.email),
    columns: {
      role: true,
    },
  });
  if (!userRole) {
    throw createError("Invalid email or password", "BAD_REQUEST");
  }
  const data = await auth.api.signInEmail({
    body: { email: input.email, password: input.password, rememberMe: true },
    headers: context.headers,
  });

  if (!data?.user || !data?.token) {
    throw createError("Invalid email or password", "BAD_REQUEST");
  }

  return {
    token: data?.token,
    user: data?.user as unknown as User,
  };
};

export const signUp = async ({
  input,
  context,
}: {
  input: SignUpInput;
  context: Context;
}) => {
  if (
    !SIGNUP_ALLOWED_ORIGINS.includes(
      context.origin as (typeof SIGNUP_ALLOWED_ORIGINS)[number],
    )
  ) {
    throw createError("Unauthorized", "UNAUTHORIZED");
  }

  const userRole = await db.query.user.findFirst({
    where: eq(user.email, input.email),
    columns: {
      role: true,
    },
  });

  if (userRole) {
    throw createError("User already exists", "BAD_REQUEST");
  }

  const data = await auth.api.signUpEmail({
    body: input,
    headers: context.headers,
  });

  if (!data?.user) {
    throw createError("Failed to sign up", "BAD_REQUEST");
  }

  if (context.origin === "external") {
    await db.insert(professional).values({ userId: data.user.id });
  }

  return {
    token: data.token,
    user: data.user as unknown as User,
  };
};

export const sendVerificationEmail = async ({
  input,
  context,
}: {
  input: SendVerificationEmailInput;
  context: Context;
}) => {
  const userData = await db.query.user.findFirst({
    where: eq(user.email, input.email),
    columns: {
      id: true,
      emailVerified: true,
    },
  });

  if (!userData) {
    throw createError("User not found", "NOT_FOUND");
  }

  if (userData.emailVerified) {
    throw createError("Email already verified", "BAD_REQUEST");
  }

  await auth.api.sendVerificationOTP({
    body: { email: input.email, type: input.type },
    headers: context.headers,
  });

  return {
    success: true,
    message: "Verification email sent successfully",
  };
};

export const verifyEmailOtp = async ({ email, otp }: VerifyEmailOTPInput) => {
  await auth.api.verifyEmailOTP({
    body: { email, otp },
  });

  return {
    success: true,
    message: "Email verified successfully",
  };
};

export const forgetPassword = async ({ email }: ForgetPasswordInput) => {
  const userData = await db.query.user.findFirst({
    where: eq(user.email, email),
    columns: {
      id: true,
    },
  });

  if (!userData) {
    throw createError("User not found", "NOT_FOUND");
  }

  await auth.api.forgetPasswordEmailOTP({
    body: { email },
  });

  return {
    success: true,
    message: "Please check your email for password reset OTP",
  };
};

export const changePassword = async ({
  input,
  context,
}: {
  input: ChangePasswordInput;
  context: Context;
}) => {
  await auth.api.changePassword({
    body: {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      revokeOtherSessions: true,
    },
    headers: context.headers,
  });

  return {
    success: true,
    message: "Password changed successfully",
  };
};

export const resetPassword = async ({
  input,
  context,
}: {
  input: ResetPasswordInput;
  context: Context;
}) => {
  await auth.api.resetPasswordEmailOTP({
    body: { email: input.email, otp: input.otp, password: input.password },
    headers: context.headers,
  });

  return {
    success: true,
    message: "Password reset successfully",
  };
};

export const signOut = async ({ context }: { context: Context }) => {
  await auth.api.signOut({
    headers: context.headers,
  });

  return {
    success: true,
    message: "Signed out successfully",
  };
};
