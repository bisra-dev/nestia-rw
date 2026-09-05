"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LockKeyhole, Mail } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Login failed");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-lg bg-gray-200 p-12 shadow-sm shadow-[#16171C]"
      >
        <h2 className="text-3xl font-bold normal-case text-[#16171C] mb-6">Nestia Admin</h2>

        {error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <div>
          <label htmlFor="email" className="block mb-3 flex items-center justify-between">
            <span className="text-sm font-bold uppercase text-[#4E4A42]">Email Address</span>
            <span>
              <Mail width={25} height={25} className="object-contain"/>
            </span>
          </label>
          <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-[#fff] border-2 border-[#16171C] rounded-md shadow-sm outline-none transition-all focus:ring-2 text-sm"
         />
        </div>
        <div className="mt-4 mb-10">
          <label htmlFor="email" className="block mb-3 flex items-center justify-between">
            <span className="text-sm font-bold uppercase text-[#4E4A42]">Password</span>
            <span>
              <Lock width={25} height={25} className="object-contain"/>
            </span>
          </label>
          <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 bg-[#fff] border-2 border-[#16171C] rounded-md shadow-sm outline-none transition-all focus:ring-2 text-sm text-[#2A2724]"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[#16171C] py-3.5 text-lg font-medium text-white hover:bg-[#2A2724] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}