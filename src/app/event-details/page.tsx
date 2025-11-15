"use client";

import { usePlanForm } from "@/hooks/usePlanForm";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function EventDetailsPage() {
  const router = useRouter();
  const { form, update } = usePlanForm();

  return (
    <div className="h-screen w-full flex flex-col px-20 py-8 overflow-hidden">
      {/* Top Progress Bar */}
      <div className="mb-8 flex-shrink-0">
        <ProgressBar currentStep={2} />
      </div>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-2 gap-10 px-8 overflow-hidden">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center">
          <h1 className="text-[36px] font-semibold text-gray-900">
            Event Details
          </h1>
          <p className="mt-4 text-gray-600 text-lg leading-relaxed max-w-md">
            Provide details about your event to help us tailor your experience.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-center gap-6 overflow-y-auto pr-4">
          {/* Event Name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Event Name
            </label>
            <input
              type="text"
              value={form.event_name || ""}
              onChange={(e) => update({ event_name: e.target.value })}
              className="mt-1 p-3 border rounded-lg text-gray-900"
              placeholder="Enter your event name"
            />
          </div>

          {/* Event Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Event Date
            </label>
            <input
              type="date"
              value={form.event_date || ""}
              onChange={(e) => update({ event_date: e.target.value })}
              className="mt-1 p-3 border rounded-lg text-gray-900"
            />
          </div>

          {/* Event Time */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Event Time
            </label>
            <input
              type="time"
              value={form.event_time || ""}
              onChange={(e) => update({ event_time: e.target.value })}
              className="mt-1 p-3 border rounded-lg text-gray-900"
            />
          </div>

          {/* Event Location - simple text input */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Event Location
            </label>
            <input
              type="text"
              value={form.event_location || ""}
              onChange={(e) => update({ event_location: e.target.value })}
              className="mt-1 p-3 border rounded-lg text-gray-900"
              placeholder="Enter event address or location"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the full address of your event
            </p>
          </div>

          {/* Continue Button */}
          <button
            className="mt-6 bg-[#0A4A45] hover:bg-[#083a36] text-white py-4 text-lg rounded-full transition-all"
            onClick={() => router.push("/trip-details")}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}