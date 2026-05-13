ALTER TABLE "request_history" DROP CONSTRAINT "request_history_created_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "request_history" DROP CONSTRAINT "request_history_updated_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "request_history" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "request_history" DROP COLUMN "updated_by";