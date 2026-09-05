"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { getOrderForUser } from "@/database/actions/orders";


import ClassicLoader from "@/components/mvpblocks/classic-loader";
import  Avatar from "@/lib/avatar";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";




type OrderStatus = "Frame" | "Upholstery" | "Finished";

interface Order {
  id: string;
  fullName: string;
  associatedEmail: string;
  description: string;
  buildPhotographyUrl: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

 

const steps = [
  { name: "FRAME", description: "Woodworking & Structure" },
  { name: "UPHOLSTERY", description: "Padding & textile application" },
  { name: "FINISHED", description: "Quality & packaging" },
];

const getStepIndex = (status: string) => {
  if (status === "Frame") return 0;
  if (status === "Upholstery") return 1;
  return 2; 
};

export default function TrackingTimelinePage() {
  const [isOpen, setIsOpen] = useState(false);

   const router = useRouter();
    async function handleLogout() {
      await fetch("/api/admin/client-logout", { method: "POST" });
      router.push("/");
      router.refresh();
    }


  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const email = searchParams.get("email");
  const fullName = searchParams.get("fullName");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !email) {
      setError("Missing order reference or email.");
      setLoading(false);
      return;
    }

    getOrderForUser(id, email).then((result) => {
      if (result.success && result.data) {
        setOrder(result.data as Order);
      } else {
        setError(result.error || "Order not found.");
      }
      setLoading(false);
    });
  }, [id, email]);

  const { data } = useSWR(
    order ? `/api/orders/${order.id}/status` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  if (!email) {
    return <div className="p-6 text-sm text-gray-500">No user email provided.</div>;
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
        <div>
          <ClassicLoader/>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
        <p className="text-red-600 font-medium">{error}</p>
      </main>
    );
  }

  const liveStatus = data?.status ?? order.status;
  const currentStepIndex = getStepIndex(liveStatus);
  const lastUpdated = new Date(data?.updatedAt ?? order.updatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-olive-50 text-[#1C1A17] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mt-4">
        <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1.03, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="flex justify-between gap-1 items-center py-4 px-4 mb-10 bg-gray-200/20 rounded-xl  shadow-lg">
            <header className="flex flex-col items-start">
              <div className="flex flex-row items-center flex-wrap gap-2 lg:gap-3">
                <Avatar email={email} />
                <div className="mt-1 text-sm text-[#706B64]">
                  <p className=""><span className="font-bold text-[#16171C] text-md">{order.fullName}</span></p>
                  <p>{lastUpdated}</p>
                </div>
              </div>
            </header>

            <div className="flex items-center flex-row gap-6">
              <div className="hidden lg:block md:block relative group">
                <button className="relative inline-block p-px font-semibold leading-6 text-white bg-gray-800 shadow-sm cursor-pointer rounded-xl shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95">
                  <span className="absolute inset-0 rounded-xl bg-linear-to-r from-teal-400 via-blue-500 to-purple-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="relative z-10 block px-6 py-2.5 rounded-xl bg-gray-900">
                    <div className="relative z-10 flex items-center space-x-2">
                        <span className="transition-all duration-500 group-hover:translate-x-1">
                          Order : <span className="uppercase">{order.id}</span>
                        </span>
                    </div>
                  </span>
                </button>
              </div>

              <div className="lg:hidden md:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="bg-gray-900 p-1.5 rounded-sm hover:bg-white">
                  <span className="text-white hover:text-black">
                    <Menu width={25} height={25}/>
                  </span>
                </button>
                { isOpen && (
                  <div className="absolute overflow-hidden right-4 mt-2 w-45 ml-6 rounded-md border border-white/10 bg-white/30 py-2 pl-6 shadow-sm backdrop-blur-md">
                    <div className="py-1 text-gray-900 px-5">
                      
                      <div className="relative mt-6 mb-1 inline-flex items-center justify-center gap-4 group">
                        <div className="absolute inset-0 duration-1000 opacity-60 transitiona-all bg-linear-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-sm filter group-hover:opacity-100 group-hover:duration-200" />
                        <a role="button" className="group relative inline-flex items-center justify-center text-base rounded-xl bg-gray-900 px-5 py-2 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-sm hover:-translate-y-0.5 whitespace-nowrap cursor-pointer" title="payment" onClick={handleLogout}>
                          Sign Out
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:block md:block">
                <div className="relative inline-flex items-center justify-center gap-4 group">
                  <div className="absolute inset-0 duration-1000 opacity-60 transitiona-all bg-linear-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-sm filter group-hover:opacity-100 group-hover:duration-200" />
                  <a role="button" className="group relative inline-flex items-center justify-center text-base rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-sm hover:-translate-y-0.5 whitespace-nowrap cursor-pointer" title="payment" onClick={handleLogout}>
                    Sign Out
                  <svg aria-hidden="true" viewBox="0 0 10 10" height={10} width={10} fill="none" className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2">
                      <path d="M0 5h7" className="transition opacity-0 group-hover:opacity-100" />
                      <path d="M1 1l4 4-4 4" className="transition group-hover:translate-x-0.75" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            
          </div>
        </motion.div>

        <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1.03, x: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
        >
          <div className="relative group mb-6 lg:hidden md:hidden">
            <button className="relative inline-block p-px font-semibold leading-6 text-white bg-gray-800 shadow-sm cursor-pointer rounded-xl shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95">
                <span className="absolute inset-0 rounded-xl bg-linear-to-r from-teal-400 via-blue-500 to-purple-500 p-0.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="relative z-10 block px-6 py-2.5 rounded-xl bg-gray-900">
                  <div className="relative z-10 flex items-center space-x-2">
                      <span className="transition-all duration-500 group-hover:translate-x-1">
                        Order : <span className="uppercase">{order.id}</span>
                      </span>
                  </div>
                </span>
            </button>
          </div>
        </motion.div>
        {/* TIMELINE */}
        <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1.03, x: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        >
          <section className="bg-gray-200/20 border border-[#E5E2DA] rounded-xl p-6 sm:p-10 shadow-sm shadow-[#16171C] mb-8" aria-label="Order Tracking Timeline">
            <div className="flex items-start justify-between relative">
              <div className="absolute top-[26px] left-[50px] right-[50px] h-[2px] bg-[#E5E2DA] z-0" />
              <div
                className="absolute top-6.5 left-3 h-0.5 bg-[#16171C] z-0 transition-all duration-700 ease-in-out"
                style={{ width: `${currentStepIndex === 0 ? "0%" : currentStepIndex === 1 ? "50%" : "100%"}` }}
              />

              {steps.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;

                return (
                  <div key={step.name} className="flex flex-col items-center text-center relative z-10 w-1/3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#2A2724] border-[#2A2724] text-white"
                        : isActive
                          ? "bg-white border-[#16171C] text-[#2A2724] ring-5 ring-blue-200"
                          : "bg-white border-[#DCDAD4] text-[#98948E]"
                    }`}>
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      ) : (
                        <span className="text-sm font-mono font-medium">{idx + 1}</span>
                      )}
                    </div>

                    <h3 className={`mt-4 text-[#16171C] font-bold text-lg transition-colors ${isActive || isCompleted ? "text-[#2A2724]" : "text-[#98948E]"}`}>
                      {step.name}
                    </h3>
                    <p className="text-xs text-[#706B64] px-4 max-w-sm">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>         
          </section>
        </motion.div>

        {/* DETAILS */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1.03, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white border border-[#E5E2DA] rounded-xl overflow-hidden shadow-sm">
          
            <div className="md:col-span-5 bg-[#F2EFE9] h-64 md:h-full relative min-h-[280px]">
              {/* eslint-disable-next-line */}
              <img
                src={order.buildPhotographyUrl || "/hero-admin.jpg"}
                alt="Custom order rendering"
                className="w-full h-full object-cover mix-blend-multiply"
              />
              <span className="absolute top-4 left-4 bg-[#2A2724]/90 text-white font-mono uppercase text-[10px] tracking-widest px-2.5 py-1 rounded backdrop-blur-sm">
                Your Custom Build
              </span>
            </div>

            <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <h2 className="text-2xl font-bold normal-case text-[#16171C]">Nestia Furniture</h2>
              <p className="text-md leading-normal mb-5 mt-1 text-black">
                Transform your living room into a private five-star lounge with our premium quality materials built to last generations.<br/>
                <span className="text-blue-200 hidden">{order.description}</span>             
            </p>

              <div className="pt-4 border-t border-[#F2EFE9] flex items-center justify-between text-xs text-[#706B64]">
                <div>
                  <p className="uppercase text-[10px] tracking-wider text-[#98948E] font-semibold">Crafting Location</p>
                  <p className="text-[#16171C] font-medium mt-0.5">KGL Production House.</p>
                </div>
              </div>
            </div>
          </section>
        </motion.div>

      </div>
    </main>
  );
}