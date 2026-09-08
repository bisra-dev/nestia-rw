
import { getAllOrders } from "@/database/actions/orders";
import { getApprovedRequisitions } from "@/database/actions/requisitions";
import { BookCheck, ChartSpline, CircleStar, ListOrdered } from "lucide-react";

interface Order {
  id: string;
  email: string;
  description: string;
  status: "Frame" | "Upholstery" | "Finished";
  date: string;
}

const STATUS_COLORS: Record<string, string> = {
  Frame: "#378ADD",
  Upholstery: "#BA7517",
  Finished: "#0F6E56",
};

const STATUS_ORDER = ["Frame", "Upholstery", "Finished"] as const;

export default async function ReportsPage() {
  const result = await getAllOrders();
  const approvedResult = await getApprovedRequisitions();
  const rawOrders = result.success ? result.data : [];
  const approvedRequisitions = approvedResult.success ? approvedResult.data : [];

  const orders: Order[] = rawOrders.map((o) => ({
    id: o.id,
    email: o.associatedEmail,
    description: o.description,
    status: o.status,
    date: new Date(o.createdAt).toISOString().split("T")[0],
  }));

  const approvedMaterials = approvedRequisitions.flatMap((requisition) =>
    requisition.items.map((item) => ({
      carpenterName: requisition.carpenterName,
      approvedAt: requisition.approvedAt
        ? new Date(requisition.approvedAt).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
    }))
  );

  const totalOrders = orders.length;
  const inProgress = orders.filter((o) => o.status !== "Finished").length;
  const finished = orders.filter((o) => o.status === "Finished").length;

  const statusCounts = STATUS_ORDER.reduce<Record<string, number>>((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status).length;
    return acc;
  }, {});

  return (
    <main className="min-h-screen mt-6">
      <h1 className="text-2xl text-[#16171C] font-bold text-center mb-8">
        Reports
      </h1>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4">
            <p className="text-[13px] text-[#7A746B] mb-1">Total orders</p>
            <p className="text-2xl font-medium text-[#2A2724] flex items-center justify-between">
              <span>{totalOrders}</span>
              <span className="text-blue-600">
                <CircleStar width={40} height={40} />
              </span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-[13px] text-[#7A746B] mb-1">Finished</p>
            <p className="text-2xl font-medium text-[#2A2724] flex items-center justify-between">
              <span>{finished}</span>
              <span className="text-green-600">
                <BookCheck width={40} height={40} />
              </span>
              </p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-[13px] text-[#7A746B] mb-1">In progress</p>
            <p className="text-2xl font-medium text-[#2A2724] flex items-center justify-between">
              <span>{inProgress}</span>
              <span className="text-yellow-600">
                <ChartSpline width={40} height={40} />
              </span>
            </p>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white mt-12 rounded-xl border border-[#EAE7E1] p-8">
          <p className="text-lg text-[#16171C] font-semibold mb-8">
            Orders By Status
          </p>
          <div className="flex flex-col gap-3 pb-8">
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status] ?? 0;
              const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;

              return (
                <div key={status}>
                  <div className="flex justify-between text-[13px] mb-4">
                    <span className="text-[#5C564E]">{status}</span>
                    <span className="text-[#2A2724] font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 bg-[#F4F2EE] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: STATUS_COLORS[status] ?? "#8A8378",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white mt-12 rounded-xl border border-[#EAE7E1] p-8">
          <p className="text-lg text-[#16171C] font-semibold mb-8">
            Approved Materials
          </p>

          {approvedMaterials.length === 0 ? (
            <p className="text-sm text-[#5C564E]">No approved materials yet.</p>
          ) : (
            <div className="mt-2 hidden overflow-hidden rounded-lg border border-[#D9CFBE] sm:block">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#D9CFBE] bg-[#EFE7D8] text-left text-[#5C5346]">
                    <th className="px-4 py-3 font-medium">Carpenter</th>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="w-32 px-4 py-3 font-medium">Quantity</th>
                    <th className="w-36 px-4 py-3 font-medium">Unit</th>
                    <th className="w-48 px-4 py-3 font-medium">Approved at</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedMaterials.map((material, index) => (
                    <tr key={`${material.carpenterName}-${material.itemName}-${material.approvedAt}-${index}`} className="border-b border-[#EAE2D2] last:border-0">
                      <td className="px-4 py-2 text-[#2A2724]">{material.carpenterName}</td>
                      <td className="px-4 py-2 text-[#2A2724]">{material.itemName}</td>
                      <td className="px-4 py-2 text-[#2A2724]">{material.quantity}</td>
                      <td className="px-4 py-2 text-[#2A2724]">{material.unit}</td>
                      <td className="px-4 py-2 text-[#2A2724]">{material.approvedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}