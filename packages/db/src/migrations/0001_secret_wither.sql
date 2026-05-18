CREATE TABLE "uploaded_file" (
	"key" text PRIMARY KEY NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "request_history" RENAME COLUMN "stage_completed_at" TO "completed_at";--> statement-breakpoint
ALTER TABLE "request" DROP CONSTRAINT "request_created_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "request" DROP CONSTRAINT "request_updated_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "request" ALTER COLUMN "current_stage_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "request_history" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "request_history" ADD COLUMN "skipped_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "uploaded_file" ADD CONSTRAINT "uploaded_file_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "uploaded_file_uploaded_by_idx" ON "uploaded_file" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "uploaded_file_created_at_idx" ON "uploaded_file" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "request" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "request" DROP COLUMN "updated_by";--> statement-breakpoint
ALTER TABLE "request_history" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "request_history" DROP COLUMN "status_ar";--> statement-breakpoint
ALTER TABLE "request_history" DROP COLUMN "payment_status";--> statement-breakpoint
ALTER TABLE "request_history" DROP COLUMN "payment_status_ar";