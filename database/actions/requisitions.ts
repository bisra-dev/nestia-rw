'use server';

import { asc, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '../db';
import { admins, materialRequisitions, orders, requisitionItems } from '@/database/schema';
import { getAdminSession } from '@/lib/session';
import { resend } from '@/lib/resend';
import CarpenterOrderNotification from '@/emails/CarpenterNotificatio/Carpenter';
import ShopManagerApprovalNotification from '@/emails/ManagerApproval/ShopManager';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nestia-rw.vercel.app';

async function getActiveFrameOrder() {
  const [activeOrder] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.status, 'Frame'))
    .orderBy(desc(orders.createdAt))
    .limit(1);

  return activeOrder ?? null;
}

async function notifyCarpenters(orderId: string) {
  const carpenters = await db
    .select({ email: admins.email, name: admins.name })
    .from(admins)
    .where(eq(admins.role, 'carpenter'));

  await Promise.allSettled(
    carpenters.map((carpenter) =>
      resend.emails.send({
        from: 'Nestia Furniture <onboarding@resend.dev>',
        to: carpenter.email,
        subject: `Order #${orderId} is ready for framing`,
        react: CarpenterOrderNotification({
          orderId,
          carpenterName: carpenter.name,
          portalUrl: `${appUrl}/admin/carpenter`,
        }),
      })
    )
  );
}

async function notifyShopManagers(orderId: string, requestedBy: string) {
  const shopManagers = await db
    .select({ email: admins.email })
    .from(admins)
    .where(eq(admins.role, 'shopmanager'));

  await Promise.allSettled(
    shopManagers.map((manager) =>
      resend.emails.send({
        from: 'Nestia Furniture <onboarding@resend.dev>',
        to: manager.email,
        subject: `Materials approval needed for order #${orderId}`,
        react: ShopManagerApprovalNotification({
          orderId,
          requestedBy,
          approvalUrl: `${appUrl}/admin/shop-manager`,
        }),
      })
    )
  );
}

export type RequisitionStatus = 'pending' | 'approved' | 'denied';

export type RequisitionRowInput = {
  item: string;
  quantity: number | string;
  unit: string;
};

export type FrameSummary = {
  height?: string;
  width?: string;
  depth?: string;
  material?: string;
};

export async function saveFrameMeasurements({
  height,
  width,
  depth,
  material,
}: FrameSummary) {
  const trimmedHeight = String(height ?? '').trim();
  const trimmedWidth = String(width ?? '').trim();
  const trimmedDepth = String(depth ?? '').trim();
  const trimmedMaterial = String(material ?? '').trim();

  if (!trimmedHeight || !trimmedWidth || !trimmedDepth) {
    return { success: false, error: 'Enter height, width, and depth before saving.' };
  }

  try {
    const [requisition] = await db
      .insert(materialRequisitions)
      .values({
        carpenterName: 'Frame specialist',
        frameHeightCm: Number(trimmedHeight),
        frameWidthCm: Number(trimmedWidth),
        frameDepthCm: Number(trimmedDepth),
        frameMaterial: null,
        status: 'approved',
      })
      .returning({ id: materialRequisitions.id });

    if (!requisition) {
      return { success: false, error: 'Could not save the measurements.' };
    }

    try {
      const activeOrder = await getActiveFrameOrder();
      if (activeOrder) {
        await notifyCarpenters(activeOrder.id);
      }
    } catch (emailError) {
      console.error('Carpenter notification failed:', emailError);
    }

    revalidatePath('/admin/carpenter');
    revalidatePath('/admin/shop-manager');

    return {
      success: true,
      requisitionId: requisition.id,
      measurements: {
        height: trimmedHeight,
        width: trimmedWidth,
        depth: trimmedDepth,
        material: trimmedMaterial,
      },
    };
  } catch (error) {
    console.error('saveFrameMeasurements failed:', error);
    return { success: false, error: 'Failed to save the measurements.' };
  }
}

export async function getLatestFrameMeasurements() {
  try {
    const requisitions = await db
      .select()
      .from(materialRequisitions)
      .orderBy(desc(materialRequisitions.createdAt));

    const latest = requisitions.find((requisition) =>
      requisition.frameHeightCm != null ||
      requisition.frameWidthCm != null ||
      requisition.frameDepthCm != null ||
      requisition.frameMaterial
    );

    if (!latest) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        height: latest.frameHeightCm != null ? String(latest.frameHeightCm) : '',
        width: latest.frameWidthCm != null ? String(latest.frameWidthCm) : '',
        depth: latest.frameDepthCm != null ? String(latest.frameDepthCm) : '',
        material: latest.frameMaterial ?? '',
      },
    };
  } catch (error) {
    console.error('getLatestFrameMeasurements failed:', error);
    return { success: false, error: 'Failed to load measurements.', data: null };
  }
}

export async function createMaterialRequisition({
  carpenterName,
  rows,
  frame,
}: {
  carpenterName?: string;
  rows: RequisitionRowInput[];
  frame?: FrameSummary | null;
}) {
  const session = await getAdminSession();
  const [carpenterUser] = await db
    .select({ name: admins.name })
    .from(admins)
    .where(eq(admins.role, 'carpenter'))
    .limit(1);
  const resolvedCarpenterName = (
    (session?.role === 'carpenter' ? session.name : null)?.trim() ||
    carpenterUser?.name?.trim() ||
    carpenterName?.trim() ||
    'Carpenter station'
  ).trim();

  const cleanedRows = rows
    .map((row) => ({
      item: String(row.item ?? '').trim(),
      quantity: Number(row.quantity),
      unit: String(row.unit ?? '').trim(),
    }))
    .filter((row) => row.item && Number.isFinite(row.quantity) && row.quantity > 0);

  if (cleanedRows.length === 0) {
    return { success: false, error: 'Add at least one item with a quantity before sending.' };
  }

  try {
    const [requisition] = await db
      .insert(materialRequisitions)
      .values({
        carpenterName: resolvedCarpenterName,
        frameHeightCm: frame?.height ? Number(frame.height) : null,
        frameWidthCm: frame?.width ? Number(frame.width) : null,
        frameDepthCm: frame?.depth ? Number(frame.depth) : null,
        frameMaterial: frame?.material?.trim() || null,
        status: 'pending',
      })
      .returning({ id: materialRequisitions.id });

    if (!requisition) {
      return { success: false, error: 'Could not create the requisition.' };
    }

    await db.insert(requisitionItems).values(
      cleanedRows.map((row) => ({
        requisitionId: requisition.id,
        itemName: row.item,
        quantity: row.quantity,
        unit: row.unit,
      }))
    );

    try {
      const activeOrder = await getActiveFrameOrder();
      if (activeOrder) {
        await notifyShopManagers(activeOrder.id, resolvedCarpenterName);
      }
    } catch (emailError) {
      console.error('Shop manager notification failed:', emailError);
    }

    revalidatePath('/admin/shop-manager');
    revalidatePath('/admin/carpenter');

    return { success: true, requisitionId: requisition.id };
  } catch (error) {
    console.error('createMaterialRequisition failed:', error);
    return { success: false, error: 'Failed to submit the requisition.' };
  }
}

export async function getPendingRequisitions() {
  try {
    const requisitions = await db
      .select()
      .from(materialRequisitions)
      .where(eq(materialRequisitions.status, 'pending'))
      .orderBy(desc(materialRequisitions.createdAt));

    const data = await Promise.all(
      requisitions.map(async (requisition) => {
        const items = await db
          .select()
          .from(requisitionItems)
          .where(eq(requisitionItems.requisitionId, requisition.id))
          .orderBy(asc(requisitionItems.createdAt));

        return {
          ...requisition,
          items,
        };
      })
    );

    return { success: true, data: data.filter((requisition) => requisition.items.length > 0) };
  } catch (error) {
    console.error('getPendingRequisitions failed:', error);
    return { success: false, error: 'Failed to load requisitions.', data: [] };
  }
}

export async function getApprovedRequisitions() {
  try {
    const rows = await db
      .select({
        id: materialRequisitions.id,
        carpenterName: admins.name,
        requisitionName: materialRequisitions.carpenterName,
        approvedAt: materialRequisitions.updatedAt,
        itemName: requisitionItems.itemName,
        quantity: requisitionItems.quantity,
        unit: requisitionItems.unit,
      })
      .from(materialRequisitions)
      .leftJoin(admins, eq(admins.name, materialRequisitions.carpenterName))
      .leftJoin(requisitionItems, eq(requisitionItems.requisitionId, materialRequisitions.id))
      .where(eq(materialRequisitions.status, 'approved'))
      .orderBy(desc(materialRequisitions.updatedAt), asc(requisitionItems.createdAt));

    const grouped = new Map<string, {
      id: string;
      carpenterName: string;
      approvedAt: Date | string | null;
      items: Array<{ itemName: string; quantity: number; unit: string }>;
    }>();

    rows.forEach((row) => {
      if (!row.itemName || row.quantity == null || !row.unit) {
        return;
      }

      const key = String(row.id);
      const existing = grouped.get(key);
      const resolvedName = row.carpenterName?.trim() || row.requisitionName?.trim() || 'Unknown carpenter';

      if (!existing) {
        grouped.set(key, {
          id: key,
          carpenterName: resolvedName,
          approvedAt: row.approvedAt,
          items: [{ itemName: row.itemName, quantity: row.quantity, unit: row.unit }],
        });
        return;
      }

      existing.items.push({ itemName: row.itemName, quantity: row.quantity, unit: row.unit });
    });

    const data = Array.from(grouped.values()).filter((requisition) => requisition.items.length > 0);

    return { success: true, data };
  } catch (error) {
    console.error('getApprovedRequisitions failed:', error);
    return { success: false, error: 'Failed to load approved requisitions.', data: [] };
  }
}

export async function updateMaterialRequisitionStatus(id: string, status: RequisitionStatus) {
  if (!id) {
    return { success: false, error: 'Missing requisition id.' };
  }

  try {
    const [updated] = await db
      .update(materialRequisitions)
      .set({ status, updatedAt: new Date() })
      .where(eq(materialRequisitions.id, id))
      .returning({ id: materialRequisitions.id, status: materialRequisitions.status });

    if (!updated) {
      return { success: false, error: 'Requisition not found.' };
    }

    revalidatePath('/admin/shop-manager');
    revalidatePath('/admin/carpenter');
    revalidatePath('/admin/reports');

    return { success: true, requisition: updated };
  } catch (error) {
    console.error('updateMaterialRequisitionStatus failed:', error);
    return { success: false, error: 'Failed to update requisition status.' };
  }
}

export async function approveRequisition(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  return updateMaterialRequisitionStatus(id, 'approved');
}

export async function denyRequisition(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  return updateMaterialRequisitionStatus(id, 'denied');
}
