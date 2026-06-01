CREATE TABLE "tts_requests" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"prompt" text NOT NULL,
	"text" text NOT NULL,
	"speaker" varchar(100) NOT NULL,
	"style" text DEFAULT '' NOT NULL,
	"model" varchar(100) DEFAULT 'gemini-2.5-flash-preview-tts' NOT NULL,
	"language" varchar(10) DEFAULT 'tr' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"license_id" varchar(255) NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "tts_requests_user_id_idx" ON "tts_requests" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "tts_requests_status_idx" ON "tts_requests" USING btree ("status");
