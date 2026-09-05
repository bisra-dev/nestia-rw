
import { getAllOrders } from "@/database/actions/orders";
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
  const rawOrders = result.success ? result.data : [];

  const orders: Order[] = rawOrders.map((o) => ({
    id: o.id,
    email: o.associatedEmail,
    description: o.description,
    status: o.status,
    date: new Date(o.createdAt).toISOString().split("T")[0],
  }));

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
      </div>
    </main>
  );
}