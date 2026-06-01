ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "lemon_squeezy_customer_id" varchar(255);
--> statement-breakpoint
ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "lemon_squeezy_order_id" varchar(255);
--> statement-breakpoint
ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "lemon_squeezy_subscription_id" varchar(255);
--> statement-breakpoint
ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "lemon_squeezy_variant_id" varchar(255);
--> statement-breakpoint
ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "customer_email" varchar(255);
--> statement-breakpoint
ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
