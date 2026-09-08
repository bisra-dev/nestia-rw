"use client";

import { useEffect, useState } from "react";
import {
  createMaterialRequisition,
  getLatestFrameMeasurements,
} from "@/database/actions/requisitions";
import { fraunces, inter } from "../lib/fonts";
import { toast } from "sonner";

type Row = { id: string; item: string; quantity: string; unit: string };
type FrameContext = {
  height: string;
  width: string;
  depth: string;
  material: string;
};

const units = ["Meters", "Millimeters", "Inches", "Feet", "Pieces", "Blocks", "Yards"];

function makeRow(): Row {
  return { id: crypto.randomUUID(), item: "", quantity: "", unit: units[0] };
}

const defaultFrameContext: FrameContext = {
  height: "180",
  width: "90",
  depth: "45",
  material: "Wood",
};

export default function CarpenterPage() {
  const [rows, setRows] = useState<Row[]>([makeRow(), makeRow(), makeRow()]);
  const [frame, setFrame] = useState<FrameContext>(defaultFrameContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMeasurementsLocked, setIsMeasurementsLocked] = useState(false);

  useEffect(() => {
    async function loadMeasurements() {
      const result = await getLatestFrameMeasurements();
      if (!result.success || !result.data) {
        return;
      }

      setFrame((current) => ({
        height: result.data?.height || current.height,
        width: result.data?.width || current.width,
        depth: result.data?.depth || current.depth,
        material: result.data?.material || current.material,
      }));
      setIsMeasurementsLocked(true);
    }

    loadMeasurements();
  }, []);

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [...rs, makeRow()]);
  }

  function removeRow(id: string) {
    setRows((rs) => rs.filter((r) => r.id !== id));
  }

  async function handleSend() {
    const filled = rows.filter((r) => r.item.trim() && Number(r.quantity) > 0);
    if (filled.length === 0) {
      toast.error("Add at least one item with a quantity before sending.");
      return;
    }

    setIsSubmitting(true);

    const result = await createMaterialRequisition({
      rows: filled.map((row) => ({
        item: row.item,
        quantity: row.quantity,
        unit: row.unit,
      })),
      frame: {
        height: frame.height,
        width: frame.width,
        depth: frame.depth,
        material: frame.material,
      },
    });

    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to send request.");
      return;
    }

    setRows([makeRow(), makeRow(), makeRow()]);
    toast.success("Request sent to the shop manager.");
  }

  return (
      <div className={`${fraunces.variable} ${inter.variable} min-h-screen font-[(--font-body)`}>
        <main className="rounded-t-2xl bg-white px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-2xl font-semibold text-[#2B2620] sm:text-3xl">
              Material requisition
            </h1>

            <div className="mt-6 rounded-xl border border-[#D9CFBE] bg-[#F9F5EF] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[#2B2620]">Measurements</h2>
                {isMeasurementsLocked && (
                  <span className="rounded-full bg-[#E8F3EB] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[#2E6B46]">
                    Submitted
                  </span>
                )}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[#5C5346]">Height (cm)</span>
                  <input
                    type="number"
                    min="0"
                    value={frame.height}
                    readOnly={isMeasurementsLocked}
                    onChange={(e) => setFrame((f) => ({ ...f, height: e.target.value }))}
                    className="w-full rounded-md border border-[#D9CFBE] bg-white px-3 py-2.5 outline-none focus:border-[#B6803F] focus:ring-1 focus:ring-[#B6803F] disabled:cursor-not-allowed disabled:bg-[#F3EFEA]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[#5C5346]">Width (cm)</span>
                  <input
                    type="number"
                    min="0"
                    value={frame.width}
                    readOnly={isMeasurementsLocked}
                    onChange={(e) => setFrame((f) => ({ ...f, width: e.target.value }))}
                    className="w-full rounded-md border border-[#D9CFBE] bg-white px-3 py-2.5 outline-none focus:border-[#B6803F] focus:ring-1 focus:ring-[#B6803F] disabled:cursor-not-allowed disabled:bg-[#F3EFEA]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[#5C5346]">Depth (cm)</span>
                  <input
                    type="number"
                    min="0"
                    value={frame.depth}
                    readOnly={isMeasurementsLocked}
                    onChange={(e) => setFrame((f) => ({ ...f, depth: e.target.value }))}
                    className="w-full rounded-md border border-[#D9CFBE] bg-white px-3 py-2.5 outline-none focus:border-[#B6803F] focus:ring-1 focus:ring-[#B6803F] disabled:cursor-not-allowed disabled:bg-[#F3EFEA]"
                  />
                </label>
              </div>

              {isMeasurementsLocked && (
                <p className="mt-3 text-sm text-[#4B5D52]">
                   Update the frame submission if a new measurement is required.
                </p>
              )}
            </div>

            <div className="mt-8 hidden overflow-hidden rounded-lg border border-[#D9CFBE] sm:block">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#D9CFBE] bg-[#EFE7D8] text-left text-[#5C5346]">
                    <th className="px-4 py-3 font-medium">Materials</th>
                    <th className="w-32 px-4 py-3 font-medium">Quantity</th>
                    <th className="w-36 px-4 py-3 font-medium">Unit</th>
                    <th className="w-12 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-[#EAE2D2] last:border-0">
                      <td className="px-4 py-2">
                        <input
                          value={row.item}
                          onChange={(e) => updateRow(row.id, { item: e.target.value })}
                          placeholder="Materials"
                          className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 outline-none focus:border-[#B6803F] focus:bg-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={row.quantity}
                          onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                          placeholder="0"
                          className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 outline-none focus:border-[#B6803F] focus:bg-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={row.unit}
                          onChange={(e) => updateRow(row.id, { unit: e.target.value })}
                          className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 outline-none focus:border-[#B6803F] focus:bg-white"
                        >
                          {units.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          aria-label="Remove row"
                          className="text-[#B08968] hover:text-[#8C4A2F]"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 space-y-3 sm:hidden">
              {rows.map((row, i) => (
                <div key={row.id} className="rounded-lg border border-[#D9CFBE] bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#8A8072]">Item {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="text-sm text-[#8C4A2F]"
                    >
                      Remove
                    </button>
                  </div>
                  <label className="mb-3 block">
                    <span className="mb-1 block text-sm font-medium text-[#5C5346]">Item</span>
                    <input
                      value={row.item}
                      onChange={(e) => updateRow(row.id, { item: e.target.value })}
                      placeholder="Mahogany planks"
                      className="w-full rounded-md border border-[#D9CFBE] px-3 py-2.5 outline-none focus:border-[#B6803F] focus:ring-1 focus:ring-[#B6803F]"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-[#5C5346]">Quantity</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={row.quantity}
                        onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                        placeholder="0"
                        className="w-full rounded-md border border-[#D9CFBE] px-3 py-2.5 outline-none focus:border-[#B6803F] focus:ring-1 focus:ring-[#B6803F]"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-[#5C5346]">Unit</span>
                      <select
                        value={row.unit}
                        onChange={(e) => updateRow(row.id, { unit: e.target.value })}
                        className="w-full rounded-md border border-[#D9CFBE] px-3 py-2.5 outline-none focus:border-[#B6803F] focus:ring-1 focus:ring-[#B6803F]"
                      >
                        {units.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRow}
              className="mt-4 text-sm font-medium text-[#8C4A2F] hover:text-[#6B3A22]"
            >
              + Add item
            </button>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleSend}
                disabled={isSubmitting}
                className="w-full rounded-md bg-[#16171c] py-3 text-base font-medium text-white hover:bg-green-500 hover:text-white transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </main>
      </div>
  );
}