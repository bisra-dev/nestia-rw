"use client";

import React, { useState } from "react";
import { ActiveOrderLog } from "./OverviewDashboard";
import { createOrder, deleteOrder, updateOrder } from "@/database/actions/orders";
import { BuildPhotoUpload } from "@/components/BuildPhotoUpload";
import { toast } from "sonner";

interface OrderManagementDrawerProps {
  activeOrder: ActiveOrderLog | null;
  onClose: () => void;
  onSave: (savedData: {
    id: string;
    email: string;
    description: string;
    fullScreen?: boolean;
    status: "Frame" | "Upholstery" | "Finished";
  }) => void;
}

export default function OrderManagementDrawer({ 
  activeOrder, 
  onClose, 
}: OrderManagementDrawerProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [formOrderId] = useState(
    () => activeOrder?.id ?? `ORD-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [formEmail, setFormEmail] = useState(activeOrder?.email ?? "");
  const [formDesc, setFormDesc] = useState(activeOrder?.description ?? "");
  const [formStatus, setFormStatus] = useState<"Frame" | "Upholstery" | "Finished">(
    activeOrder?.status ?? "Frame"
  );
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handleFormSubmission = async (formData: FormData) => {
    formData.append('status', formStatus);
    if (photoUrl) {
      formData.append('buildPhotographyUrl', photoUrl);
    }

    const result = activeOrder
      ? await updateOrder(activeOrder.id, formData)
      : await createOrder(formData);

    if (result.success) {
      
      toast.success(activeOrder ? `Order successfully updated!` : `Order successfully saved!`);
    

      if (onClose) onClose();
    } else {
      
      toast.error(result.error || `Failed to find your order.`)
    }
  };

  
const handleTableDelete = async () => {
  if (!activeOrder) return; 

  const confirmDelete = window.confirm(
    `Are you sure you want to delete order ${activeOrder.id}?`
  );
  if (!confirmDelete) return;

  setIsDeleting(true);
  try {
    const result = await deleteOrder(activeOrder.id);
    if (result.success) {
      toast.success("Order deleted successfully.");
      onClose();
    } else {
      toast.error(result.error || "Failed to delete the order.");
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    toast.error("Failed to delete the order.");
  } finally {
    setIsDeleting(false);
  }
};


  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="w-full bg-white shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto rounded-xl transform transition-transform duration-300">
        <form action={handleFormSubmission} className="space-y-6 mt-10">
          <h3 className="text-2xl text-[#16171C] font-semibold text-center mb-10">
            {activeOrder ? `Update Order` : "Order Form"}
          </h3>
          
          <div className="grid lg:grid-cols-2 md:grid-cols-2 gap-4">
            <div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4E4A42] mb-2">Order Reference ID</label>
                <input 
                  type="text" 
                  required 
                  disabled
                  value={formOrderId}
                  className="w-full px-3 py-2 border border-[#DCDAD4] rounded-md font-mono text-xs bg-[#FAF9F6] text-[#7A746B]"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4E4A42] mb-2">Associated Email</label>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="client@domain.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCDAD4] rounded-md text-sm text-[#2A2724] focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] outline-none"
                />
              </div>

              <div className="hidden mt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4E4A42] mb-2">Description</label>
                <textarea 
                  name="description" 
                  rows={3} 
                  required
                  placeholder="Detail wood grains, structural treatments, texturing updates..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCDAD4] rounded-md text-sm text-[#2A2724] resize-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] outline-none"
                />
              </div>
            </div>

            <div>
              <div className="border-2 border-dashed border-[#DCDAD4] rounded-xl p-4 text-center bg-[#FAF9F6] relative hover:bg-[#F4F2EE] transition-colors cursor-pointer">
                <BuildPhotoUpload onUploadSuccess={(url) => setPhotoUrl(url)} />
                {activeOrder && !photoUrl && (
                  <p className="text-xs text-blue-600 mt-1">Current photo will be kept unless you upload a new one.</p>
                )}
                <div className="text-xs text-[#7A746B] mt-2">
                  <p className="text-[10px] mr-0">PNG or JPEG supported up to 5MB</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4E4A42] mb-3">Order Status</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#F4F2EE] rounded-lg">
              {(["Frame", "Upholstery", "Finished"] as const).map((phase) => (
                <button
                  key={phase}
                  type="button"
                  onClick={() => setFormStatus(phase)}
                  className={`py-2 text-xs font-medium rounded-md transition-all ${
                    formStatus === phase 
                      ? "bg-[#16171C] text-white shadow-xs font-semibold" 
                      : "text-[#7A746B] hover:text-[#2A2724]"
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-[#EAE7E1]">
            <div className="mt-10 flex justify-end gap-6">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2.5 text-sm font-semibold uppercase text-[#16171C] border border-[#16171C] rounded-lg hover:bg-[#2A2724] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || !activeOrder}
                onClick={handleTableDelete}
                className="px-3 py-2.5 bg-blue-500 hover:bg-[#2A2724] text-white rounded-lg text-sm font-semibold uppercase tracking-wider disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "delete"}
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#16171C] hover:bg-green-500 text-white rounded-lg text-sm font-semibold uppercase tracking-wider"
              >
              save order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}