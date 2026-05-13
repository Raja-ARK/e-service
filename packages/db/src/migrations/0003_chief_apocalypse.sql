ALTER TABLE "department" RENAME COLUMN "created_by_user_id" TO "created_by";--> statement-breakpoint
ALTER TABLE "department" RENAME COLUMN "updated_by_user_id" TO "updated_by";--> statement-breakpoint
ALTER TABLE "request" RENAME COLUMN "requested_user_id" TO "requested_by";--> statement-breakpoint
ALTER TABLE "request_history" RENAME COLUMN "performed_by_user_id" TO "performed_by";--> statement-breakpoint
ALTER TABLE "service" RENAME COLUMN "created_by_user_id" TO "created_by";--> statement-breakpoint
ALTER TABLE "service" RENAME COLUMN "updated_by_user_id" TO "updated_by";--> statement-breakpoint
ALTER TABLE "action" RENAME COLUMN "created_by_user_id" TO "created_by";--> statement-breakpoint
ALTER TABLE "action" RENAME COLUMN "updated_by_user_id" TO "updated_by";--> statement-breakpoint
ALTER TABLE "stage" RENAME COLUMN "created_by_user_id" TO "created_by";--> statement-breakpoint
ALTER TABLE "stage" RENAME COLUMN "updated_by_user_id" TO "updated_by";--> statement-breakpoint
ALTER TABLE "department" DROP CONSTRAINT "department_created_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "department" DROP CONSTRAINT "department_updated_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "request" DROP CONSTRAINT "request_requested_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "request_history" DROP CONSTRAINT "request_history_performed_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "service" DROP CONSTRAINT "service_created_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "service" DROP CONSTRAINT "service_updated_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "action" DROP CONSTRAINT "action_created_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "action" DROP CONSTRAINT "action_updated_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "stage" DROP CONSTRAINT "stage_created_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "stage" DROP CONSTRAINT "stage_updated_by_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "request_requested_user_id_idx";--> statement-breakpoint
DROP INDEX "request_history_performed_by_user_id_idx";--> statement-breakpoint
ALTER TABLE "service" ADD COLUMN "service_code" text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lookup_options" ADD CONSTRAINT "lookup_options_parent_fk" FOREIGN KEY ("parent_type","parent_code") REFERENCES "public"."lookup_options"("type","code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action" ADD CONSTRAINT "action_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action" ADD CONSTRAINT "action_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage" ADD CONSTRAINT "stage_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage" ADD CONSTRAINT "stage_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lookup_options_parent_idx" ON "lookup_options" USING btree ("parent_type","parent_code");--> statement-breakpoint
CREATE INDEX "request_requested_by_idx" ON "request" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX "request_history_performed_by_user_id_idx" ON "request_history" USING btree ("performed_by");--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_service_code_unique" UNIQUE("service_code");