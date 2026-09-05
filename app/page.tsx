"use client";

import { Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from 'next/navigation';

import { getOrderForUser } from '@/database/actions/orders';

import { motion } from "framer-motion";

export default function TrackOrderHomepage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ orderId?: string; email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { orderId?: string; email?: string } = {};
    if (!orderId.trim()) newErrors.orderId = "Order Reference ID is required";
    if (!email.trim()) newErrors.email = "Associated Email Address is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);

    try {
      const result = await getOrderForUser(orderId, email);
      if (result.success && result.data) {
        setIsLoading(false);
        router.push(`/root?id=${orderId}&email=${encodeURIComponent(email)}`);
      } else {
        setIsLoading(false);
        setErrors({
          orderId: result.error || "Could not find an order matching these credentials."
        });
      }
    } catch (err) {
      setIsLoading(false);
      setErrors({ orderId: "An unexpected connection error occurred." });
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#FBFBFA] text-[#1C1A17]">
      
      {/* LEFT PANEL */}
      <section className="hidden lg:flex lg:col-span-5 relative hero-bg bg-cover bg-center text-white p-12 flex-col justify-between overflow-hidden">
        <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1.03, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative z-10">
            <h1 className="text-4xl font-light tracking-tight mt-4 font-serif">
              Nestia Furniture
            </h1>
            <h3 className="text-[#16171C] font-semibold text-md">Track Your Order in Real Time</h3>
          </div>
        </motion.div>
      </section>

      {/* Tracking Portal */}
      <section className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 sm:px-16 lg:px-24">

        <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1.03, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        >
        
          {/* Mobile Header */}
          <div className="w-full max-w-md lg:hidden text-center mb-2">
            <h1 className="text-3xl font-bold normal-case text-[#16171C] mb-4">Nestia</h1>
          </div>

          <div className="w-full max-w-md px-6 py-6 bg-gray-200/80 backdrop-blur-xl shadow-sm shadow-[#16171C] rounded-xl">
            <header className="mb-6">
              <h2 className="text-4xl font-bold normal-case text-[#16171C]">Track Your Order</h2>
              <p className="text-md text-[#706B64] mt-2">
                Enter your dispatch credentials to view real-time production, assembly, and shipping milestones.
              </p>
            </header>

            {/* Form container */}
            <form onSubmit={handleTrackingSubmit} className="space-y-5" noValidate>
              {/* Input: Order ID */}
              <div>
                <label htmlFor="orderId" className="block mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold uppercase text-[#4E4A42]">Order Reference ID</span>
                  <span>
                    <ShieldCheck width={25} height={25} className="object-contain"/>
                  </span>
                </label>
                <input
                  id="orderId"
                  type="text"
                  placeholder="ORD-1026"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className={`w-full px-4 py-4 bg-white border ${
                    errors.orderId ? "border-red-500 focus:ring-red-200" : "border-[#DCDAD4] focus:ring-[#C5A880]"
                  } rounded-md shadow-sm outline-none transition-all focus:ring-2 font-mono text-sm tracking-wide text-[#2A2724]`}
                />
                {errors.orderId && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{errors.orderId}</p>
                )}
              </div>

              {/* Input: Email */}
              <div>
                <label htmlFor="email" className="block mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold uppercase text-[#4E4A42]">Email Address</span>
                  <span>
                    <Mail width={25} height={25} className="object-contain"/>
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.email ? "border-red-500 focus:ring-red-200" : "border-[#DCDAD4] focus:ring-[#C5A880]"
                  } rounded-md shadow-sm outline-none transition-all focus:ring-2 text-sm text-[#2A2724]`}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{errors.email}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#16171C] hover:bg-[#2A2724] text-white py-3.5 px-4 rounded-md font-bold text-lg shadow transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A880] focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span className="text-xl">Track Order</span>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
