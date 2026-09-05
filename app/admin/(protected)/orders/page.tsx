
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/database/actions/orders";
import { BuildPhotoUpload } from "@/components/BuildPhotoUpload";
import { toast } from "sonner";

export default function NewOrderPage() {
  const router = useRouter(); 
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState<"Frame" | "Upholstery" | "Finished">("Frame");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmission = async (formData: FormData) => {
    setIsSubmitting(true);
    formData.append("status", formStatus);
    if (photoUrl) {
      formData.append("buildPhotographyUrl", photoUrl);
    }

    const result = await createOrder(formData);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Order successfully saved!`);
      router.push("/admin/orders");
    } else {
      toast.error(result.error || `Failed to find your order.`);
    }
  };

  return (
    <main className="min-h-screen w-full px-2">
      <h1 className="text-2xl text-[#16171C] font-bold text-center mb-8 leading-normal">
        New Order Form
      </h1>
      <div className="w-full mx-auto bg-white rounded-lg shadow-sm px-4 py-4">
        <form action={handleFormSubmission} className="space-y-6 mb-2">
          <div className="grid lg:grid-cols-2 gap-5">
            <div>
              <div className="hidden">
                <label className="block text-sm font-bold uppercase tracking-wider text-[#4E4A42] mb-2">Order Reference ID</label>
                <input 
                  type="text" 
                  name="id"
                  required 
                  disabled
                  value={formId}
                  className="w-full px-3 py-2 border border-[#DCDAD4] rounded-md font-mono text-xs bg-[#FAF9F6] text-[#7A746B]"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">
                  Customer Name
                </label>
                <input
                  name="fullName"
                  type="text"
                  value={formName}
                  placeholder="Full Name"
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCDAD4] rounded-md text-sm text-[#2A2724] focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] outline-none"
                />
              </div>

              <div className="mt-4">
                <label className="block text- font-bold uppercase tracking-wider text-black mb-2">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="example@mail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCDAD4] rounded-md text-sm text-[#2A2724] focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] outline-none"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text- font-bold uppercase tracking-wider text-black mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  required
                  placeholder="The Minimalistic Lounge Chair..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCDAD4] rounded-md text-sm text-[#2A2724] resize-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] outline-none"
                />
              </div>
            </div>
            <div className="mt-4">
                <div>
                <label className="block text- font-bold uppercase tracking-wider text-black mb-2">
                  Photography
                </label>
                <div className="border-2 border-dashed border-[#DCDAD4] rounded-xl p-4 pt-8 pb-6 text-center bg-[#FAF9F6] relative hover:bg-[#F4F2EE] transition-colors">
                  <BuildPhotoUpload onUploadSuccess={(url) => setPhotoUrl(url)} />
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text- font-bold uppercase tracking-wider text-black mb-3">
              Order Status
            </label>
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

          <div className="pt-6 border-t border-[#EAE7E1] flex justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 hover:bg-[#16171C] bg-green-600 text-white rounded-lg text-sm font-semibold uppercase tracking-wider disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Order"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}