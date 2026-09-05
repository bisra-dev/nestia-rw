"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, BarChart3,Settings } from "lucide-react";
import LogoutButton from "../components/LogoutButton";
import { Toaster } from "sonner";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings/change-password", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-[#EEEEEE]">
      <aside className="w-[30%] lg:w-64 bg-white text-[#16171C] flex flex-col shrink-0 border-r border-[#ECEAE5]">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#16171C] max-w-3xl hidden lg:block">
            Nestia
          </h1>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-[#16171C] text-white font-medium"
                    : "text-[#16171C] hover:bg-[#FAF9F6] hover:text-[#16171C]"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}


          <div className="fixed py-4 border-t border-[#6B6860] bottom-0 w-[25%] lg:w-[18%]">
            <div className="pb-12">
              <LogoutButton />
            </div>
          </div>

        </nav>

        
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
          <Toaster richColors position="top-right" />
        </main>
      </div>
    </div>
  );
}