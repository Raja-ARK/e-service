import { env } from "@e-service/env/server";
import nodemailer, { type SendMailOptions } from "nodemailer";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export type SendMailResult =
  | { success: true; error: null; messageId: string }
  | { success: false; error: string; messageId: null };

export async function sendMail(
  options: SendMailOptions,
): Promise<SendMailResult> {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      cc: env.SMTP_CC_MAILS?.split(",") ?? [],
      ...options,
    });
    return { success: true, error: null, messageId: info.messageId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      messageId: null,
    };
  }
}
