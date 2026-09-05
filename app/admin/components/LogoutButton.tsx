
"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-left text-[#16171C] hover:bg-[#16171C] hover:text-white transition-colors"
    >
      <LogOut size={18} strokeWidth={1.75} />
      Logout
    </button>
  );
}