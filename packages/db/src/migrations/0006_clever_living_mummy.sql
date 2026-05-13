ALTER TABLE "action" ALTER COLUMN "action_variant" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "action" ALTER COLUMN "action_variant" SET DEFAULT 'primary'::text;--> statement-breakpoint
DROP TYPE "public"."stage_action_variant";--> statement-breakpoint
CREATE TYPE "public"."stage_action_variant" AS ENUM('primary', 'secondary', 'warning', 'warning-outline', 'outline', 'ghost', 'link');--> statement-breakpoint
ALTER TABLE "action" ALTER COLUMN "action_variant" SET DEFAULT 'primary'::"public"."stage_action_variant";--> statement-breakpoint
ALTER TABLE "action" ALTER COLUMN "action_variant" SET DATA TYPE "public"."stage_action_variant" USING "action_variant"::"public"."stage_action_variant";--> statement-breakpoint
ALTER TABLE "catalog" ALTER COLUMN "logo" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "service" ALTER COLUMN "logo" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "action" ALTER COLUMN "show_condition" SET DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "action" ALTER COLUMN "outcome" SET DEFAULT 'null'::jsonb;