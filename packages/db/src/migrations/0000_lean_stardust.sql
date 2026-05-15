CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('external', 'internal', 'admin');--> statement-breakpoint
CREATE TYPE "public"."email_template_type" AS ENUM('sign-up', 'service', 'forget-password', 'email-verification');--> statement-breakpoint
CREATE TYPE "public"."menu_type" AS ENUM('internal', 'external', 'admin');--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('text', 'number', 'date', 'textarea', 'select', 'radio', 'checkbox', 'file', 'time', 'switch', 'slider', 'rating', 'avatar', 'tag-input');--> statement-breakpoint
CREATE TYPE "public"."form_template_type" AS ENUM('normal', 'table', 'multiple', 'list');--> statement-breakpoint
CREATE TYPE "public"."form_type" AS ENUM('step', 'group');--> statement-breakpoint
CREATE TYPE "public"."rule_trigger" AS ENUM('on_change', 'on_next', 'on_submit');--> statement-breakpoint
CREATE TYPE "public"."step_type" AS ENUM('normal', 'tab');--> statement-breakpoint
CREATE TYPE "public"."eligible_by" AS ENUM('always', 'status-wise');--> statement-breakpoint
CREATE TYPE "public"."stage_action_type_external" AS ENUM('submit', 'payment', 'certificate', 'intermediate-submission');--> statement-breakpoint
CREATE TYPE "public"."stage_action_type_internal" AS ENUM('approve', 'reject', 'send-back', 'schedule-inspection', 'complete-inspection');--> statement-breakpoint
CREATE TYPE "public"."stage_action_variant" AS ENUM('primary', 'secondary', 'warning', 'warning-outline', 'outline', 'ghost', 'link');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('professional', 'corporate');--> statement-breakpoint
CREATE TYPE "public"."hour_format" AS ENUM('12', '24');--> statement-breakpoint
CREATE TYPE "public"."items_per_page" AS ENUM('10', '20', '30', '40', '50', '75', '100');--> statement-breakpoint
CREATE TYPE "public"."languages" AS ENUM('english', 'arabic');--> statement-breakpoint
CREATE TYPE "public"."portal_type" AS ENUM('external', 'internal');--> statement-breakpoint
CREATE TYPE "public"."theme" AS ENUM('light', 'dark');--> statement-breakpoint
CREATE TABLE "announcement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"title_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"attachment" text,
	"issue_date" timestamp with time zone NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"category" "category"[] DEFAULT '{"corporate","professional"}' NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp (6) with time zone NOT NULL,
	"expires_at" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "role" DEFAULT 'external' NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"gender" "gender",
	"mobile" text,
	"nationality" text,
	"emirate_id" text,
	"dob" timestamp with time zone,
	"language" "languages" DEFAULT 'english',
	"date_format" text DEFAULT 'DD MMM YYYY',
	"date_time_format" text DEFAULT 'DD MMM, YYYY hh:mm a',
	"items_per_page" "items_per_page" DEFAULT '10',
	"time_format" text DEFAULT 'hh:mm a',
	"hour_format" "hour_format" DEFAULT '12',
	"theme" "theme" DEFAULT 'light',
	"timezone" text DEFAULT 'Asia/Dubai',
	"currency" text DEFAULT 'USD',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"status" text,
	"status_ar" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_user" (
	"company_id" uuid NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "department" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"description_ar" text,
	"logo" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "department_name_unique" UNIQUE("name"),
	CONSTRAINT "department_name_ar_unique" UNIQUE("name_ar")
);
--> statement-breakpoint
CREATE TABLE "document_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"html" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_template_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "email_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"html" text NOT NULL,
	"type" "email_template_type" DEFAULT 'service' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_template_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "lookup_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"label_ar" text NOT NULL,
	"parent_type" text,
	"parent_code" text,
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "lookup_options_type_code_unique" UNIQUE("type","code")
);
--> statement-breakpoint
CREATE TABLE "menu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" text NOT NULL,
	"name_ar" text,
	"icon" text,
	"link" text,
	"is_group" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"type" "menu_type" DEFAULT 'internal' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text DEFAULT 'E Service Digital Platform' NOT NULL,
	"name_ar" text DEFAULT 'منصة الخدمات الرقمية' NOT NULL,
	"logo" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"timezone" text DEFAULT 'Asia/Dubai' NOT NULL,
	"language" "languages" DEFAULT 'english' NOT NULL,
	"date_format" text DEFAULT 'DD MMM YYYY' NOT NULL,
	"date_time_format" text DEFAULT 'DD MMM, YYYY hh:mm a' NOT NULL,
	"time_format" text DEFAULT 'hh:mm a' NOT NULL,
	"hour_format" "hour_format" DEFAULT '12' NOT NULL,
	"theme" "theme" DEFAULT 'light' NOT NULL,
	"items_per_page" "items_per_page" DEFAULT '10' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professional" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"status" text,
	"status_ar" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"service_request_no" text NOT NULL,
	"status" text NOT NULL,
	"status_ar" text NOT NULL,
	"submission_date" timestamp with time zone DEFAULT now() NOT NULL,
	"requested_by" text NOT NULL,
	"category" "category" NOT NULL,
	"current_stage_id" uuid,
	"company_id" uuid,
	"professional_id" uuid,
	"payment_status" text,
	"payment_status_ar" text,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"form_data" jsonb,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "request_service_request_no_unique" UNIQUE("service_request_no")
);
--> statement-breakpoint
CREATE TABLE "request_assignee" (
	"request_id" uuid NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "request_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"stage_completed_at" timestamp with time zone,
	"action_id" uuid,
	"performed_by" text NOT NULL,
	"comments" text,
	"status" text,
	"status_ar" text,
	"payment_status" text,
	"payment_status_ar" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" text NOT NULL,
	"heading_ar" text NOT NULL,
	"logo" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"service_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_point" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"text_ar" text NOT NULL,
	"order" smallint DEFAULT 0 NOT NULL,
	"catalog_id" uuid,
	"sub_catalog_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_sub_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" text NOT NULL,
	"heading_ar" text NOT NULL,
	"order" smallint DEFAULT 0 NOT NULL,
	"catalog_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_field" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"step_id" uuid,
	"group_id" uuid,
	"label" text NOT NULL,
	"label_ar" text NOT NULL,
	"placeholder" text,
	"placeholder_ar" text,
	"helper_text" text,
	"helper_text_ar" text,
	"type" "field_type" NOT NULL,
	"order" smallint DEFAULT 0 NOT NULL,
	"visibility_condition" jsonb,
	"hide_for" "portal_type",
	"config" jsonb DEFAULT '{"required":false,"disabled":false,"minLength":null,"maxLength":null,"min":null,"max":null,"defaultValue":null,"allowedFileTypes":["image/jpeg","image/png","image/gif","image/webp"],"maxFileSize":10485760,"maxFileCount":1,"fieldWidth":"100%","fieldAlignment":"left","description":null,"descriptionAr":null,"prefixIcon":null,"suffixIcon":null,"pattern":null,"patternMessage":null,"patternMessageAr":null,"multiple":null}'::jsonb,
	"can_edit_in_internal" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_field_stage" (
	"field_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	CONSTRAINT "form_field_stage_field_id_stage_id_pk" PRIMARY KEY("field_id","stage_id")
);
--> statement-breakpoint
CREATE TABLE "form_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"step_id" uuid NOT NULL,
	"label" text NOT NULL,
	"label_ar" text NOT NULL,
	"order" smallint DEFAULT 0 NOT NULL,
	"hide_for" "portal_type",
	"icon" text,
	"template_type" "form_template_type" DEFAULT 'normal' NOT NULL,
	"visibility_condition" jsonb,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_group_stage" (
	"group_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	CONSTRAINT "form_group_stage_group_id_stage_id_pk" PRIMARY KEY("group_id","stage_id")
);
--> statement-breakpoint
CREATE TABLE "form_rule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"name" text NOT NULL,
	"trigger" "rule_trigger" NOT NULL,
	"source_field_id" uuid,
	"step_id" uuid,
	"condition" jsonb DEFAULT 'null'::jsonb,
	"actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"order" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_step" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"title_ar" text NOT NULL,
	"order" smallint DEFAULT 0 NOT NULL,
	"hide_for" "portal_type",
	"color" text,
	"icon" text,
	"type" "form_type" DEFAULT 'step' NOT NULL,
	"step_type" "step_type" DEFAULT 'normal' NOT NULL,
	"template_type" "form_template_type" DEFAULT 'normal' NOT NULL,
	"visibility_condition" jsonb DEFAULT 'null'::jsonb,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_step_stage" (
	"step_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	CONSTRAINT "form_step_stage_step_id_stage_id_pk" PRIMARY KEY("step_id","stage_id")
);
--> statement-breakpoint
CREATE TABLE "prerequisite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"text_ar" text NOT NULL,
	"service_id" uuid NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"logo" text,
	"description" text NOT NULL,
	"description_ar" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"service_code" text NOT NULL,
	"department_id" uuid NOT NULL,
	"category" "category"[] DEFAULT '{"professional"}' NOT NULL,
	"prefix" text NOT NULL,
	"process_days" smallint DEFAULT 0 NOT NULL,
	"output_document_id" uuid,
	"output_doc_name" text,
	"output_doc_name_ar" text,
	"eligible_by" "eligible_by" DEFAULT 'always' NOT NULL,
	"eligible_status" text[] DEFAULT '{}',
	"completion_status" jsonb DEFAULT 'null'::jsonb,
	"register_company" boolean DEFAULT false NOT NULL,
	"completion_script" jsonb DEFAULT '[]'::jsonb,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_service_code_unique" UNIQUE("service_code")
);
--> statement-breakpoint
CREATE TABLE "action" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stage_id" uuid NOT NULL,
	"action_name" text NOT NULL,
	"action_name_ar" text NOT NULL,
	"action_variant" "stage_action_variant" DEFAULT 'primary' NOT NULL,
	"type_external" "stage_action_type_external",
	"type_internal" "stage_action_type_internal",
	"order" smallint DEFAULT 0 NOT NULL,
	"icon" text,
	"modal_icon" text,
	"disabled" boolean DEFAULT false NOT NULL,
	"show_condition" jsonb DEFAULT 'null'::jsonb,
	"outcome" jsonb DEFAULT 'null'::jsonb,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "action_complete_stage" (
	"action_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	CONSTRAINT "action_complete_stage_action_id_stage_id_pk" PRIMARY KEY("action_id","stage_id")
);
--> statement-breakpoint
CREATE TABLE "action_email" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_id" uuid NOT NULL,
	"email_template_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "action_email_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_email_id" uuid NOT NULL,
	"document_template_id" uuid,
	"file_url" text
);
--> statement-breakpoint
CREATE TABLE "action_remove_stage" (
	"action_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	CONSTRAINT "action_remove_stage_action_id_stage_id_pk" PRIMARY KEY("action_id","stage_id")
);
--> statement-breakpoint
CREATE TABLE "action_skip_stage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"condition" jsonb DEFAULT 'null'::jsonb,
	"outcome" jsonb DEFAULT 'null'::jsonb
);
--> statement-breakpoint
CREATE TABLE "stage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"title_ar" text NOT NULL,
	"order" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"service_id" uuid NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_user" ADD CONSTRAINT "company_user_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_user" ADD CONSTRAINT "company_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_template" ADD CONSTRAINT "document_template_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_template" ADD CONSTRAINT "document_template_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_template" ADD CONSTRAINT "email_template_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_template" ADD CONSTRAINT "email_template_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lookup_options" ADD CONSTRAINT "lookup_options_parent_fk" FOREIGN KEY ("parent_type","parent_code") REFERENCES "public"."lookup_options"("type","code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu" ADD CONSTRAINT "menu_parent_id_menu_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional" ADD CONSTRAINT "professional_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_current_stage_id_stage_id_fk" FOREIGN KEY ("current_stage_id") REFERENCES "public"."stage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_professional_id_professional_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professional"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_assignee" ADD CONSTRAINT "request_assignee_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_assignee" ADD CONSTRAINT "request_assignee_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_action_id_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."action"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog" ADD CONSTRAINT "catalog_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog" ADD CONSTRAINT "catalog_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog" ADD CONSTRAINT "catalog_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_point" ADD CONSTRAINT "catalog_point_catalog_id_catalog_id_fk" FOREIGN KEY ("catalog_id") REFERENCES "public"."catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_point" ADD CONSTRAINT "catalog_point_sub_catalog_id_catalog_sub_catalog_id_fk" FOREIGN KEY ("sub_catalog_id") REFERENCES "public"."catalog_sub_catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_sub_catalog" ADD CONSTRAINT "catalog_sub_catalog_catalog_id_catalog_id_fk" FOREIGN KEY ("catalog_id") REFERENCES "public"."catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_step_id_form_step_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."form_step"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_group_id_form_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."form_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_field_stage" ADD CONSTRAINT "form_field_stage_field_id_form_field_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."form_field"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_field_stage" ADD CONSTRAINT "form_field_stage_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_group" ADD CONSTRAINT "form_group_step_id_form_step_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."form_step"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_group" ADD CONSTRAINT "form_group_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_group" ADD CONSTRAINT "form_group_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_group_stage" ADD CONSTRAINT "form_group_stage_group_id_form_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."form_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_group_stage" ADD CONSTRAINT "form_group_stage_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_rule" ADD CONSTRAINT "form_rule_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_rule" ADD CONSTRAINT "form_rule_source_field_id_form_field_id_fk" FOREIGN KEY ("source_field_id") REFERENCES "public"."form_field"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_rule" ADD CONSTRAINT "form_rule_step_id_form_step_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."form_step"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_rule" ADD CONSTRAINT "form_rule_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_rule" ADD CONSTRAINT "form_rule_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_step" ADD CONSTRAINT "form_step_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_step" ADD CONSTRAINT "form_step_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_step" ADD CONSTRAINT "form_step_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_step_stage" ADD CONSTRAINT "form_step_stage_step_id_form_step_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."form_step"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_step_stage" ADD CONSTRAINT "form_step_stage_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prerequisite" ADD CONSTRAINT "prerequisite_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prerequisite" ADD CONSTRAINT "prerequisite_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prerequisite" ADD CONSTRAINT "prerequisite_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_output_document_id_document_template_id_fk" FOREIGN KEY ("output_document_id") REFERENCES "public"."document_template"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action" ADD CONSTRAINT "action_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action" ADD CONSTRAINT "action_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action" ADD CONSTRAINT "action_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_complete_stage" ADD CONSTRAINT "action_complete_stage_action_id_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."action"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_complete_stage" ADD CONSTRAINT "action_complete_stage_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_email" ADD CONSTRAINT "action_email_action_id_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."action"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_email" ADD CONSTRAINT "action_email_email_template_id_email_template_id_fk" FOREIGN KEY ("email_template_id") REFERENCES "public"."email_template"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_email_attachment" ADD CONSTRAINT "action_email_attachment_action_email_id_action_email_id_fk" FOREIGN KEY ("action_email_id") REFERENCES "public"."action_email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_email_attachment" ADD CONSTRAINT "action_email_attachment_document_template_id_document_template_id_fk" FOREIGN KEY ("document_template_id") REFERENCES "public"."document_template"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_remove_stage" ADD CONSTRAINT "action_remove_stage_action_id_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."action"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_remove_stage" ADD CONSTRAINT "action_remove_stage_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_skip_stage" ADD CONSTRAINT "action_skip_stage_action_id_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."action"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_skip_stage" ADD CONSTRAINT "action_skip_stage_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage" ADD CONSTRAINT "stage_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage" ADD CONSTRAINT "stage_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage" ADD CONSTRAINT "stage_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "document_template_name_idx" ON "document_template" USING btree ("name");--> statement-breakpoint
CREATE INDEX "email_template_type_idx" ON "email_template" USING btree ("type");--> statement-breakpoint
CREATE INDEX "lookup_options_type_idx" ON "lookup_options" USING btree ("type");--> statement-breakpoint
CREATE INDEX "lookup_options_type_code_idx" ON "lookup_options" USING btree ("type","code");--> statement-breakpoint
CREATE INDEX "lookup_options_parent_idx" ON "lookup_options" USING btree ("parent_type","parent_code");--> statement-breakpoint
CREATE INDEX "professional_user_id_idx" ON "professional" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "request_service_id_idx" ON "request" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "request_requested_by_idx" ON "request" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX "request_current_stage_id_idx" ON "request" USING btree ("current_stage_id");--> statement-breakpoint
CREATE INDEX "request_company_id_idx" ON "request" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "request_professional_id_idx" ON "request" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "request_status_submission_date_idx" ON "request" USING btree ("status","submission_date");--> statement-breakpoint
CREATE INDEX "request_assignee_request_id_idx" ON "request_assignee" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "request_assignee_user_id_idx" ON "request_assignee" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "request_history_request_id_idx" ON "request_history" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "request_history_stage_id_idx" ON "request_history" USING btree ("stage_id");--> statement-breakpoint
CREATE INDEX "request_history_performed_by_user_id_idx" ON "request_history" USING btree ("performed_by");--> statement-breakpoint
CREATE INDEX "request_history_request_created_at_idx" ON "request_history" USING btree ("request_id","created_at");--> statement-breakpoint
CREATE INDEX "catalog_service_id_idx" ON "catalog" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "catalog_point_catalog_id_idx" ON "catalog_point" USING btree ("catalog_id");--> statement-breakpoint
CREATE INDEX "catalog_point_sub_catalog_id_idx" ON "catalog_point" USING btree ("sub_catalog_id");--> statement-breakpoint
CREATE INDEX "catalog_sub_catalog_catalog_id_idx" ON "catalog_sub_catalog" USING btree ("catalog_id");--> statement-breakpoint
CREATE INDEX "form_field_step_id_idx" ON "form_field" USING btree ("step_id");--> statement-breakpoint
CREATE INDEX "form_field_group_id_idx" ON "form_field" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "form_rule_service_id_idx" ON "form_rule" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "form_rule_service_order_idx" ON "form_rule" USING btree ("service_id","order");--> statement-breakpoint
CREATE INDEX "prerequisite_service_id_idx" ON "prerequisite" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "service_department_id_idx" ON "service" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "action_stage_id_idx" ON "action" USING btree ("stage_id");--> statement-breakpoint
CREATE INDEX "action_email_action_id_idx" ON "action_email" USING btree ("action_id");--> statement-breakpoint
CREATE INDEX "action_email_attachment_action_email_id_idx" ON "action_email_attachment" USING btree ("action_email_id");--> statement-breakpoint
CREATE INDEX "action_skip_stage_action_id_idx" ON "action_skip_stage" USING btree ("action_id");--> statement-breakpoint
CREATE INDEX "action_skip_stage_stage_id_idx" ON "action_skip_stage" USING btree ("stage_id");--> statement-breakpoint
CREATE INDEX "stage_service_id_idx" ON "stage" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "stage_service_order_idx" ON "stage" USING btree ("service_id","order");