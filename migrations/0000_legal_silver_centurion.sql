CREATE TYPE "public"."order_status" AS ENUM('Frame', 'Upholstery', 'Finished');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(8) PRIMARY KEY DEFAULT substring(md5(random()::text) from 1 for 8) NOT NULL,
	"associated_email" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"build_photography_url" text,
	"status" "order_status" DEFAULT 'Frame' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
