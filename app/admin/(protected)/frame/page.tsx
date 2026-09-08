"use client";

import { useEffect, useState, type FormEvent } from "react";
import { saveFrameMeasurements } from "@/database/actions/requisitions";
import { getActiveOrder } from "@/database/actions/orders";
import { fraunces, inter } from "../lib/fonts";



type FormState = {
  height: string;
  width: string;
  depth: string;
};

export default function FrameSpecialistPage() {
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    height: "",
    width: "",
    depth: "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadActiveOrder() {
      const result = await getActiveOrder();
      if (result.success) {
        setActiveOrderId(result.data);
      }
    }

    loadActiveOrder();
    const interval = window.setInterval(loadActiveOrder, 5000);

    return () => window.clearInterval(interval);
  }, []);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.height || !form.width || !form.depth) {
      setError("Enter height, width, and depth before saving.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const result = await saveFrameMeasurements({
      height: form.height,
      width: form.width,
      depth: form.depth,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Failed to save measurements.");
      return;
    }

    setForm({ height: "", width: "", depth: "" });
    setSaved(true);
  }

  return (
    <div className="mt-12">
    <div className={`${fraunces.variable} ${inter.variable} min-h-screen font-(--font-body)`}>
      
      <main className="rounded-t-2xl bg-white px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-xl">
          <h1 className="text-2xl font-semibold text-[#2B2620] sm:text-3xl">
            Frame specialist
          </h1>
          <p className="text-m text-black mt-6">
            Active Order ID: <span className="font-bold">{activeOrderId ?? "No active order"}</span>
          </p>
          <h2 className="text-xl gfont-semibold text-[#2B2620] underline decoration-[#B6803F] underline-offset-4">
            Required Measurements
          </h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Height (cm)" value={form.height} onChange={(v) => update("height", v)} />
              <Field label="Width (cm)" value={form.width} onChange={(v) => update("width", v)} />
              <Field label="Depth (cm)" value={form.depth} onChange={(v) => update("depth", v)} />
            </div>

            {error && <p className="text-sm text-[#A32D2D]">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 rounded-md bg-[#16171C] py-3 text-base font-medium text-white hover:bg-green-500 hover:text-white transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
            >
              {isSubmitting ? "Saving..." : "Submit Measurements"}
            </button>
            {saved && <p className="text-sm text-[#4B5D52]">Measurements submitted.</p>}
          </form>
        </div>
      </main>
    </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#5C5346]">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full rounded-md border border-[#D9CFBE] bg-white px-3 py-2.5 text-base text-[#2B2620] outline-none focus:border-[#B6803F] focus:ring-1 focus:ring-[#B6803F]"
      />
    </label>
  );
}