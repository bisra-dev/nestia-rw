CREATE TYPE "public"."admin_role" AS ENUM('admin', 'staff');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "admin_role" DEFAULT 'staff' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" SET DATA TYPE varchar(7);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" SET DEFAULT 'NF-' || lpad(floor(random() * 10000)::int::text, 4, '0');