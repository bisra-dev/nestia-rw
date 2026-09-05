ALTER TABLE "orders" ALTER COLUMN "id" SET DATA TYPE varchar(8);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" SET DEFAULT 'ORD-' || lpad(floor(random() * 10000)::int::text, 4, '0');