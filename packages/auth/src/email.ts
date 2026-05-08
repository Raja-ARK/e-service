import { db } from "@e-service/db";
import { user } from "@e-service/db/schema/auth";
import { emailTemplate } from "@e-service/db/schema/email";
import { env } from "@e-service/env/server";
import { eq } from "drizzle-orm";
import ejs from "ejs";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

type EmailType = "sign-up" | "forget-password" | "email-verification";

export async function sendAuthEmail({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: EmailType;
}) {
  const [template] = await db
    .select()
    .from(emailTemplate)
    .where(eq(emailTemplate.type, type));

  if (!template) {
    throw new Error("Email template not found");
  }

  const userData = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (!userData) {
    throw new Error("User not found");
  }

  const templateVars = {
    otp,
    user: userData,
  };

  const subjectTemplate = template.subject;
  const htmlTemplate = template.html;

  const subject = ejs.render(subjectTemplate, templateVars);
  const html = ejs.render(htmlTemplate, templateVars);

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: email,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    message: "Email sent successfully",
  };
}
