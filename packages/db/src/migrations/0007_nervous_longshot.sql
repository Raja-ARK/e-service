ALTER TABLE "action" ALTER COLUMN "complete_stage_ids" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "action" ALTER COLUMN "remove_stage_ids" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "action" ALTER COLUMN "skip_stages" DROP NOT NULL;