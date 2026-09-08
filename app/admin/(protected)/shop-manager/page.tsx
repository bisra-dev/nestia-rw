"use client";

import { useEffect, useState } from "react";
import { updateMaterialRequisitionStatus, getPendingRequisitions } from "@/database/actions/requisitions";
import { fraunces, inter } from "../lib/fonts";
import { toast } from "sonner";

type Item = { id: string; itemName: string; quantity: number; unit: string };
type Order = {
  id: string;
  carpenterName: string;
  status: "pending" | "approved" | "denied";
  frameHeightCm: number | null;
  frameWidthCm: number | null;
  frameDepthCm: number | null;
  frameMaterial: string | null;
  createdAt: string | Date;
  items: Item[];
};

export default function ShopManagerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    const result = await getPendingRequisitions();
    if (result.success && result.data) {
      setOrders(
        result.data.map((order) => ({
          id: order.id,
          carpenterName: order.carpenterName,
          status: order.status,
          frameHeightCm: order.frameHeightCm,
          frameWidthCm: order.frameWidthCm,
          frameDepthCm: order.frameDepthCm,
          frameMaterial: order.frameMaterial,
          createdAt: order.createdAt,
          items: order.items.map((item) => ({
            id: item.id,
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
          })),
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function resolve(id: string, status: "approved" | "denied") {
    setActioningId(id);
    const result = await updateMaterialRequisitionStatus(id, status);
    if (result.success) {
      setOrders((os) => os.filter((order) => order.id !== id));
      toast.success(status === "approved" ? "Materials approved." : "Material request denied.");
    } else {
      toast.error(result.error ?? "Unable to update material request.");
    }
    setActioningId(null);
  }

  return (
    <div className="mt-12">
      <div className={`${fraunces.variable} ${inter.variable} min-h-screen font-(--font-body)`}>
        <main className="rounded-t-2xl bg-white px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-2xl font-semibold text-[#2B2620] sm:text-3xl">
              Shop Manager
            </h1>

            {loading ? (
              <p className="mt-8 text-sm text-[#5C5346]">Loading pending requests...</p>
            ) : orders.length === 0 ? (
              <div className="mt-8 rounded-lg border border-dashed border-[#D9CFBE] bg-[#F9F5EF] p-8 text-center">
                <p className="text-lg font-medium text-[#2B2620]">No pending material requests</p>
                <p className="mt-2 text-sm text-[#5C5346]">Submitted items will appear here for approval.</p>
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="mb-6 overflow-hidden rounded-lg border border-[#D9CFBE] bg-white">
                    <div className="flex flex-col gap-3 border-b border-[#EAE2D2] bg-[#F9F9F9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div>
                        <p className="text-lg font-semibold text-[#2B2620]">
                          <span className="font-bold uppercase">Pending request</span>
                        </p>
                        <p className="text-xs text-[#8A8072]">{order.carpenterName}</p>
                      </div>

                      <div className="text-xs text-[#5C5346]">
                        {order.frameHeightCm && order.frameWidthCm && order.frameDepthCm ? (
                          <span>
                            {order.frameWidthCm} × {order.frameHeightCm} × {order.frameDepthCm} cm
                          </span>
                        ) : (
                          <span>Frame details not provided</span>
                        )}
                      </div>
                    </div>

                    <div className="px-4 py-4 sm:px-6">
                      <table className="hidden w-full border-collapse text-sm sm:table">
                        <thead>
                          <tr className="text-left text-[#8A8072]">
                            <th className="pb-2 font-medium">Item</th>
                            <th className="w-24 pb-2 font-medium">Qty</th>
                            <th className="w-28 pb-2 font-medium">Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id} className="border-t border-[#EAE2D2]">
                              <td className="py-2 text-[#2B2620]">{item.itemName}</td>
                              <td className="py-2 text-[#2B2620]">{item.quantity}</td>
                              <td className="py-2 text-[#2B2620]">{item.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="space-y-2 sm:hidden">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between border-b border-[#EAE2D2] pb-2"
                          >
                            <span className="text-sm text-[#2B2620]">{item.itemName}</span>
                            <span className="text-sm text-[#5C5346]">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-col gap-3 border-t border-[#EAE2D2] bg-[#F9F9F9] p-4 sm:flex-row sm:justify-end sm:px-6">
                      <button
                        type="button"
                        disabled={actioningId === order.id}
                        onClick={() => resolve(order.id, "approved")}
                        className="w-full rounded-md bg-[#16171C] hover:bg-green-500 py-3 text-base font-medium text-white transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
                      >
                        {actioningId === order.id ? "Approving..." : "Approve All Materials"}
                      </button>
                      <button
                        type="button"
                        disabled={actioningId === order.id}
                        onClick={() => resolve(order.id, "denied")}
                        className="w-full rounded-md border border-[#D9CFBE] bg-transparent py-3 text-base font-medium text-[#16171C] hover:bg-red-500 hover:text-white transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
                      >
                        {actioningId === order.id ? "Updating..." : "Deny / Request Revision"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
