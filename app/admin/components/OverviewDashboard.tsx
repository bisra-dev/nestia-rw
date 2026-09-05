"use client";

import { AlarmClockCheck, TrendingUp, Truck } from "lucide-react";


export interface ActiveOrderLog {
  id: string;
  email: string;
  description: string;
  status: "Frame" | "Upholstery" | "Finished";
  date: string;
}

interface OverviewDashboardProps {
  orders: ActiveOrderLog[];
  onSelectOrderForEdit: (order: ActiveOrderLog) => void;
  onCreateNewOrderClick: () => void;
}

export default function OverviewDashboard({ 
  orders = [], 
  onSelectOrderForEdit, 
  onCreateNewOrderClick 
}: OverviewDashboardProps) {

  const activeBuildsCount = orders.filter(o => o.status === "Frame" || o.status === "Upholstery").length;
  const readyForDispatchCount = orders.filter(o => o.status === "Finished").length;

  return (
    <div className="text-[#1C1A17] font-sans antialiased">
        <div className="mb-8">
            <h1 className="text-2xl text-[#16171C] font-bold text-center">Overview and Reporting</h1>
        </div>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10" aria-label="Executive Summaries">
        <div className="bg-white p-6 rounded-xl">
          <span className="text-[12px] font-bold text-[#8A8378] uppercase tracking-widest block">Active Builds</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-light text-[#2A2724] block mt-2 font-mono">
             {activeBuildsCount}
            </span>
            <span className="text-yellow-600">
              <TrendingUp width={45} height={45}/>
            </span>
          </div>
          <span className="text-sm text-amber-700 font-medium block mt-2">In Production</span>
        </div>
        <div className="bg-white border border-[#EAE7E1] p-6 rounded-xl shadow-xs">
          <span className="text-[12px] font-bold text-[#8A8378] uppercase tracking-widest block">Ready For Dispatch</span>
          <div className="flex justify-between items-center">
            <span className="text-3xl font-light text-[#2A2724] block mt-2 font-mono">
              {readyForDispatchCount}
            </span>
            <span className="text-green-600">
              <Truck width={45} height={45}/>
            </span>
          </div>

          <span className="text-sm text-emerald-700 font-medium block mt-2">Last 30 Days</span>
        </div>
        <div className="bg-white border border-[#EAE7E1] p-6 rounded-xl shadow-xs">
          <span className="text-[12px] font-bold text-[#8A8378] uppercase tracking-widest block">Avg Turnaround Time</span>
          <div className="flex justify-between items-center">
            <span className="text-3xl font-light text-[#2A2724] block mt-2 font-mono">14.2d</span>
            <span className="text-blue-600">
              <AlarmClockCheck width={45} height={45}/>
            </span>
          </div>
          <span className="text-sm text-[#7A746B] block mt-2">Days to Completion</span>
        </div>
      </section>

      <section className="bg-white border border-[#EAE7E1] rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#EAE7E1] bg-white">
          <h2 className="text-sm font-semibold tracking-wider text-[#2A2724] uppercase">Order Master Table</h2>
        </div>
        <div className="overflow-x-auto">
          <div className="sm:hidden divide-y divide-[#F4F2EE]">
            {orders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => onSelectOrderForEdit(order)}
                className="p-4 space-y-2 cursor-pointer hover:bg-[#FAF9F6]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium text-[#2A2724] text-sm">{order.id}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    order.status === 'Frame' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    order.status === 'Upholstery' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-[#5C564E] truncate">{order.email}</div>
                <div className="text-xs text-[#8A8378]">{order.date}</div>
              </div>
            ))}
          </div>

          <table className="hidden sm:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#EAE7E1] text-[11px] font-bold uppercase tracking-wider text-[#7A746B]">
                <th className="py-4 px-6 font-medium">Order ID</th>
                <th className="py-4 px-6 font-medium">Customer Email</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F2EE] text-sm text-[#383531]">
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => onSelectOrderForEdit(order)}
                  className="hover:bg-[#FAF9F6]/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6 font-mono font-medium text-[#2A2724]">{order.id}</td>
                  <td className="py-4 px-6 text-[#5C564E]">{order.email}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      order.status === 'Frame' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      order.status === 'Upholstery' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-[#8A8378]">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}