import { db } from "@e-service/db";
import { user } from "@e-service/db/schema/auth";
import { emailTemplate } from "@e-service/db/schema/email";
import { sendMail } from "@e-service/email";
import { eq } from "drizzle-orm";
import ejs from "ejs";

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

  const templateVars = { otp, user: userData };

  const result = await sendMail({
    to: email,
    subject: ejs.render(template.subject, templateVars),
    html: ejs.render(template.html, templateVars),
  });

  console.log(result, "result");

  if (!result.success) {
    throw new Error(result.error);
  }

  return { success: true, message: "Email sent successfully" };
}
