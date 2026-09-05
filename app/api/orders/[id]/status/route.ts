import { db } from "@/database/drizzle";
import { orders } from "@/database/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic"; 

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    columns: { status: true, updatedAt: true, associatedEmail: true }, 
  });

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json(order, {
    headers: { "Cache-Control": "no-store" },
  });
}
