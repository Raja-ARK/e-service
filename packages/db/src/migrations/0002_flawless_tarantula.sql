ALTER TYPE "public"."items_per_page" ADD VALUE '75';--> statement-breakpoint
ALTER TYPE "public"."items_per_page" ADD VALUE '100';--> statement-breakpoint
ALTER TABLE "lookup_dependencies" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "lookup_dependencies" CASCADE;--> statement-breakpoint
ALTER TABLE "email_template" ALTER COLUMN "type" SET DEFAULT 'service';--> statement-breakpoint
ALTER TABLE "lookup_options" ADD COLUMN "parent_type" text;--> statement-breakpoint
ALTER TABLE "lookup_options" ADD COLUMN "parent_code" text;