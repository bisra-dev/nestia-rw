'use server';

import { db } from '../db';
import { and, eq } from 'drizzle-orm';
import { desc } from 'drizzle-orm';
import { orders, admins } from '@/database/schema'; 
import { revalidatePath } from 'next/cache';
import { resend } from '@/lib/resend';
import { Email } from "@/emails/email";
import { FinishedOrderEmail } from "@/emails/finished/Finished";
import StatusUpdateEmail from "@/emails/status/email";

type OrderStatus = "Frame" | "Upholstery" | "Finished";

async function sendFinishedOrderEmail(order: typeof orders.$inferSelect) {
  const [boss] = await db
    .select({ email: admins.email })
    .from(admins)
    .where(eq(admins.role, 'boss'));

  if (!boss?.email) {
    throw new Error('No admin with role "boss" found');
  }

  const result = await resend.emails.send({
    from: "Nestia Furniture <onboarding@resend.dev>",
    to: boss.email,
    subject: `Order #${order.id} finished`,
    react: FinishedOrderEmail({
      id: order.id,
      fullName: order.fullName,
      description: order.description,
      updatedAt: order.updatedAt
        ? new Date(order.updatedAt).toISOString()
        : new Date().toISOString(),
    }),
  });

  if (result.error) {
    throw new Error(`Finished order email failed: ${result.error.message}`);
  }
}

export async function createOrder(formData: FormData) {
  try {
    const FullName = formData.get('fullName') as string;
    const email = (formData.get('email') as string).trim().toLowerCase();
    const description = formData.get('description') as string;
    const status = (formData.get('status') as OrderStatus | null) || 'Frame';
    const buildPhotographyUrl = (formData.get('buildPhotographyUrl') as string) || null;

    const [newOrder] = await db.insert(orders).values({
      fullName: FullName,
      associatedEmail: email,
      description: description,
      buildPhotographyUrl: buildPhotographyUrl,
      status: status,
    }).returning();

    if (newOrder.status === 'Finished') {
      await sendFinishedOrderEmail(newOrder);
    }

    //Order confimation email
    try {
      const appUrl = "https://nestia-rw.vercel.app";

      await resend.emails.send({
        from: "Nestia Furniture <onboarding@resend.dev>",
        to: newOrder.associatedEmail,
        subject: `Order confirmed — #${newOrder.id}`,
        react: Email({
          id: newOrder.id,
          fullName: newOrder.fullName,
          associatedEmail: newOrder.associatedEmail,
          Url: `${appUrl}/root?id=${encodeURIComponent(newOrder.id)}&email=${encodeURIComponent(newOrder.associatedEmail)}`,
        }),
      });
    } catch (emailError) {
      console.error('Welcome email failed to send:', emailError);
    }

    revalidatePath('/admin');
    return { success: true };

  } catch (error) {
    console.error('Database Insertion Error:', error);
    return { success: false, error: 'Failed to create your order.' };
  }
}

export async function getOrders() {
  try {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
      
    return { success: true, data: allOrders };
  } catch (error) {
    console.error('Database Fetching Error:', error);
    return { success: false, error: 'Failed to retrieve orders.' };
  }
}

export async function getActiveOrder() {
  try {
    const [activeOrder] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.status, 'Frame'))
      .orderBy(desc(orders.createdAt))
      .limit(1);

    return { success: true, data: activeOrder?.id ?? null };
  } catch (error) {
    console.error('Active order fetch error:', error);
    return { success: false, error: 'Failed to retrieve the active order.', data: null };
  }
}


// delete order
export async function deleteOrder(orderId: string) {
  try {
    await db.delete(orders).where(eq(orders.id, orderId));
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error('Database Deletion Error:', error);
    return { success: false, error: 'Failed to delete the order.' };
  }
}

// Users

export async function getOrderForUser(orderId: string, email: string) {
  try {
    const matchedOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.associatedEmail, email.trim().toLowerCase())
        )
      );

    if (matchedOrders.length === 0) {
      return { success: false, error: 'No matching order parameters found.' };
    }

    return { success: true, data: matchedOrders[0] };
  } catch (error) {
    console.error('Database Verification Error:', error);
    return { success: false, error: 'Failed to authenticate order access.' };
  }
}



export async function getAllOrders() {
  try {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    return { success: true, data: allOrders };
  } catch (error) {
    console.error('Database Fetch Error:', error);
    return { success: false, error: 'Failed to fetch orders.', data: [] };
  }
}


export async function updateOrder(orderId: string, formData: FormData) {
  try {
    const email = (formData.get('email') as string).trim().toLowerCase();
    const description = formData.get('description') as string;
    const status = formData.get('status') as OrderStatus;
    const newPhotoUrl = formData.get('buildPhotographyUrl') as string | null;

    const [existingOrder] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId));

    const updateData: Partial<typeof orders.$inferInsert> = {
      associatedEmail: email,
      description: description,
      status: status,
    };

    if (newPhotoUrl) {
      updateData.buildPhotographyUrl = newPhotoUrl;
    }

    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    if (!updated) {
      throw new Error(`Order ${orderId} not found or failed to update`);
    }

    const statusChanged = existingOrder && existingOrder.status !== status;

    // status changed email (to customer)
    if (statusChanged) {
      try {
        await resend.emails.send({
          from: "Nestia Furniture <onboarding@resend.dev>",
          to: updated.associatedEmail,
          subject: `Order #${updated.id} status: ${status}`,
          react: StatusUpdateEmail({
            orderId: updated.id,
            status: updated.status,
            associatedEmail: updated.associatedEmail,
          }),
        });
      } catch (emailError) {
        console.error('Status update email failed to send:', emailError);
      }
    }

    // General Manager email — only when the order becomes "Finished"
    if (statusChanged && status === 'Finished') {
      try {
        await sendFinishedOrderEmail(updated);
      } catch (emailError) {
        console.error('General manager email failed to send:', emailError);
        return { success: false, error: (emailError as Error).message };
      }
    }

    return { success: true, order: updated };
  } catch (error) {
    console.error('updateOrder failed:', error);
    return { success: false, error: (error as Error).message };
  }
}

