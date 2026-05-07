ALTER TYPE "public"."email_template_type" ADD VALUE 'sign-up' BEFORE 'service';--> statement-breakpoint
ALTER TYPE "public"."email_template_type" ADD VALUE 'forget-password';--> statement-breakpoint
ALTER TYPE "public"."email_template_type" ADD VALUE 'email-verification';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "name_ar" text;--> statement-breakpoint
ALTER TABLE "email_template" DROP COLUMN "name_ar";