import { pgTable, text, timestamp, pgEnum, varchar, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const orderStatusEnum = pgEnum('order_status', ['Frame', 'Upholstery', 'Finished']);

export const orders = pgTable('orders', {
  id: varchar('id', { length: 8 })
    .primaryKey()
    .default(sql`'ORD-' || lpad(floor(random() * 10000)::int::text, 4, '0')`),
  fullName: varchar('full_name', { length: 255 }).notNull(), 
  associatedEmail: varchar('associated_email', { length: 255 }).notNull(),
  description: text('description').notNull(),
  buildPhotographyUrl: text('build_photography_url'),
  status: orderStatusEnum('status').default('Frame').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const adminRoleEnum = pgEnum("admin_role", ["admin", "staff"]);

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: adminRoleEnum("role").notNull().default("staff"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});