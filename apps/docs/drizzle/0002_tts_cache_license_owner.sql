ALTER TABLE "tts_cache" ADD COLUMN IF NOT EXISTS "user_id" varchar(255);
--> statement-breakpoint
ALTER TABLE "tts_cache" ADD COLUMN IF NOT EXISTS "license_id" varchar(255);
