import { getAllOrders } from "@/database/actions/orders";
import AdminOrdersClient from "./orders/AdminOrdersClient";

export default async function AdminOrdersPage() {
  const result = await getAllOrders();
  const rawOrders = result.success ? result.data : [];

  const initialOrders = rawOrders.map((o) => ({
    id: o.id,
    email: o.associatedEmail,
    description: o.description,
    status: o.status,
    date: new Date(o.createdAt).toISOString().split("T")[0],
  }));

  return <AdminOrdersClient initialOrders={initialOrders} />;
}