import { auth } from "@e-service/auth";
import { db } from "@e-service/db";
import { eq } from "@e-service/db/drizzle/orm";
import { user } from "@e-service/db/schema/auth";
import { professional } from "@e-service/db/schema/professional";
import type { User } from "@e-service/db/zod-schemas/auth";
import { ORPCError } from "@orpc/server";
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
    throw new ORPCError("BAD_REQUEST", {
      message: "Invalid email or password",
    });
  }

  const result = await auth.api.signInEmail({
    body: { email: input.email, password: input.password, rememberMe: true },
    headers: context.headers,
    returnHeaders: true,
  });

  const data = result.response;

  if (!data?.user) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Invalid email or password",
    });
  }

  const token = result.headers.get("set-auth-token") ?? "";

  if (!token) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to issue session token",
    });
  }

  return {
    user: data.user as unknown as User,
    token,
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
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  const userRole = await db.query.user.findFirst({
    where: eq(user.email, input.email),
    columns: {
      role: true,
    },
  });

  if (userRole) {
    throw new ORPCError("BAD_REQUEST", { message: "User already exists" });
  }

  const result = await auth.api.signUpEmail({
    body: input,
    headers: context.headers,
    returnHeaders: true,
  });

  const data = result.response;

  if (!data?.user) {
    throw new ORPCError("BAD_REQUEST", { message: "Failed to sign up" });
  }

  if (context.origin === "external") {
    await db.insert(professional).values({ userId: data.user.id });
  }

  const token = result.headers.get("set-auth-token") ?? "";

  return {
    user: data.user as unknown as User,
    token,
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
    throw new ORPCError("NOT_FOUND", { message: "User not found" });
  }

  if (userData.emailVerified) {
    throw new ORPCError("BAD_REQUEST", { message: "Email already verified" });
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

export const verifyEmailOtp = async ({
  input,
  context,
}: {
  input: VerifyEmailOTPInput;
  context: Context;
}) => {
  await auth.api.verifyEmailOTP({
    body: { email: input.email, otp: input.otp },
    headers: context.headers,
    returnHeaders: true,
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
    throw new ORPCError("NOT_FOUND", { message: "User not found" });
  }

  await auth.api.requestPasswordResetEmailOTP({
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
    returnHeaders: true,
  });

  return {
    success: true,
    message: "Signed out successfully",
  };
};

export const getUser = async ({ context }: { context: Context }) => {
  const session = await auth.api.getSession({ headers: context.headers });

  if (!session?.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  return {
    user: session.user as unknown as User,
  };
};
