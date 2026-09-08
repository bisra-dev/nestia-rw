import { pgTable, text, timestamp, pgEnum, varchar, uuid, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const orderStatusEnum = pgEnum('order_status', ['Frame', 'Upholstery', 'Finished']);
export const requisitionStatusEnum = pgEnum('requisition_status', ['pending', 'approved', 'denied']);

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

export const materialRequisitions = pgTable('material_requisitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  carpenterName: varchar('carpenter_name', { length: 255 }).notNull().default('Carpenter station'),
  frameHeightCm: integer('frame_height_cm'),
  frameWidthCm: integer('frame_width_cm'),
  frameDepthCm: integer('frame_depth_cm'),
  frameMaterial: varchar('frame_material', { length: 255 }),
  status: requisitionStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const requisitionItems = pgTable('requisition_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  requisitionId: uuid('requisition_id')
    .notNull()
    .references(() => materialRequisitions.id, { onDelete: 'cascade' }),
  itemName: varchar('item_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const adminRoleEnum = pgEnum("admin_role", ["boss", "shopmanager", "frame", "carpenter"]);

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: adminRoleEnum("role").notNull().default("shopmanager"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

