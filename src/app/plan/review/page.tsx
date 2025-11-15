"use client";

import { usePlanForm } from "@/hooks/usePlanForm";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function ReviewPage() {
  const router = useRouter();
  const { form, reset } = usePlanForm();

  const [confirming, setConfirming] = useState(false);

  async function handleSubmit() {
    const res = await fetch("/api/plan", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("Your flight event plan has been submitted!");
      reset();
      router.push("/"); // Redirect home or wherever you want
    } else {
      toast.error("Submission failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col px-16 py-12">
      {/* Progress Bar */}
      <ProgressBar currentStep={5} />

      <div className="max-w-xl mt-12">
        <h1 className="text-[32px] font-semibold text-gray-900">
          Review Your Plan
        </h1>
        <p className="mt-3 text-gray-600 text-lg leading-relaxed">
          Make sure everything looks correct before submitting your flight event request.
        </p>

        {/* SUMMARY */}
        <div className="mt-8 border rounded-2xl p-6 bg-gray-50 text-gray-800">
          <h2 className="text-xl font-semibold mb-4">Event Summary</h2>

          <div className="flex flex-col gap-3 text-sm">
            <p><strong>Purpose:</strong> {form.theme || "—"}</p>

            <p><strong>Event Name:</strong> {form.event_name || "—"}</p>
            <p><strong>Event Date:</strong> {form.event_date || "—"}</p>
            <p><strong>Event Time:</strong> {form.event_time || "—"}</p>
            <p><strong>Event Location:</strong> {form.event_location || "—"}</p>

            <hr className="my-2" />

            <p><strong>Origin Country:</strong> {form.origin_country || "—"}</p>
            <p><strong>Destination Country:</strong> {form.destination_country || "—"}</p>
            <p><strong>Preferred Flight Timing:</strong> {form.time_pref || "—"}</p>
            <p><strong>Group Size:</strong> {form.group_size || "—"}</p>

            <hr className="my-2" />

            <p><strong>Entertainment:</strong> {form.entertainment ? "Yes" : "No"}</p>
            <p><strong>Merchandise:</strong> {form.merch ? "Yes" : "No"}</p>
            <p><strong>Culinary Experience:</strong> {form.culinary ? "Yes" : "No"}</p>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        {!confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="mt-8 bg-[#0A4A45] hover:bg-[#083a36] text-white py-4 text-lg rounded-full transition-all w-full"
          >
            Submit Your Plan
          </button>
        )}

        {/* CONFIRMATION PROMPT */}
        {confirming && (
          <div className="mt-6 border rounded-2xl p-5 bg-white shadow-md">
            <p className="text-gray-800 text-lg font-medium mb-3">
              Are you sure you want to submit this plan?
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Once submitted, our system will process your request and begin planning your personalised flight event.
            </p>

            <div className="flex gap-4">
              {/* YES */}
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#0A4A45] hover:bg-[#083a36] text-white py-3 rounded-full transition-all"
              >
                Yes, submit now
              </button>

              {/* NO */}
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 border border-gray-400 text-gray-700 py-3 rounded-full transition-all hover:bg-gray-100"
              >
                No, review again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}