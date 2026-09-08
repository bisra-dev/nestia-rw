CREATE TYPE "public"."requisition_status" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TABLE "material_requisitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carpenter_name" varchar(255) DEFAULT 'Carpenter station' NOT NULL,
	"frame_height_cm" integer,
	"frame_width_cm" integer,
	"frame_depth_cm" integer,
	"frame_material" varchar(255),
	"status" "requisition_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requisition_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requisition_id" uuid NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "requisition_items" ADD CONSTRAINT "requisition_items_requisition_id_material_requisitions_id_fk" FOREIGN KEY ("requisition_id") REFERENCES "public"."material_requisitions"("id") ON DELETE cascade ON UPDATE no action;