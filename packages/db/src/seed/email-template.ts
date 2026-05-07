import { db } from "..";
import { emailTemplate } from "../schema";

const emailTemplates = [
  {
    name: "Sign Up",
    subject: "Verify Your Email Address",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Welcome to E-Service</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p>Hello <strong><%= user?.name || "User" %></strong>,</p>
    <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
    <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;"><%= otp %></span>
    </div>
    <p>If you did not create an account, please ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="color: #888; font-size: 12px; text-align: center;">This is an automated message, please do not reply.</p>
  </div>
</body>
</html>`,
    type: "sign-up" as const,
    isActive: true,
  },
  {
    name: "Forget Password",
    subject: "Reset Your Password",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Password Reset Request</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p>Hello <strong><%= user?.name || "User" %></strong>,</p>
    <p>We received a request to reset your password. Use the following OTP to proceed:</p>
    <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f5576c;"><%= otp %></span>
    </div>
    <p style="color: #e74c3c;"><strong>If you did not request a password reset, please ignore this email or contact support if you have concerns.</strong></p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="color: #888; font-size: 12px; text-align: center;">This is an automated message, please do not reply.</p>
  </div>
</body>
</html>`,

    type: "forget-password" as const,
    isActive: true,
  },
  {
    name: "Email Verification",
    subject: "Verify Your Email",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Email Verification</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p>Hello <strong><%= user?.name || "User" %></strong>,</p>
    <p>Please use the following OTP to verify your email address:</p>
    <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #11998e;"><%= otp %></span>
    </div>
    <p>If you did not request this verification, please ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="color: #888; font-size: 12px; text-align: center;">This is an automated message, please do not reply.</p>
  </div>
</body>
</html>`,
    type: "email-verification" as const,
    isActive: true,
  },
];

export const seedEmailTemplates = async () => {
  console.log("Seeding email templates...");

  for (const template of emailTemplates) {
    await db
      .insert(emailTemplate)
      .values(template)
      .onConflictDoNothing({ target: emailTemplate.name });
  }

  console.log("Email templates seeded successfully!");
};
