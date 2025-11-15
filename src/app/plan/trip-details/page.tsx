"use client";

import { usePlanForm } from "@/hooks/usePlanForm";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function TripDetailsPage() {
  const router = useRouter();
  const { form, update } = usePlanForm();

  return (
    <div className="min-h-screen w-full flex flex-col px-20 py-8">
      {/* Top Progress Bar */}
      <div className="mb-8">
        <ProgressBar currentStep={3} />
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-2 gap-10 px-8 py-8">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-start pt-10">
          <h1 className="text-[36px] font-semibold text-gray-900">
            Trip Details
          </h1>
          <p className="mt-4 text-gray-600 text-lg leading-relaxed max-w-md">
            Provide details about your trip to help us plan your journey.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-6">
          {/* Origin Country */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Origin Country
            </label>
            <input
              type="text"
              value={form.origin_country || ""}
              onChange={(e) => update({ origin_country: e.target.value })}
              className="mt-1 p-3 border rounded-lg text-gray-900"
              placeholder="Enter your origin country"
            />
          </div>

          {/* Destination Country */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Destination Country
            </label>
            <input
              type="text"
              value={form.destination_country || ""}
              onChange={(e) => update({ destination_country: e.target.value })}
              className="mt-1 p-3 border rounded-lg text-gray-900"
              placeholder="Enter your destination country"
            />
          </div>

          {/* Flight Timing Preference */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Preferred Flight Timing</label>
            <select
              value={form.time_pref || ""}
              onChange={(e) => update({ time_pref: e.target.value })}
              className="border p-3 rounded-xl bg-white"
            >
              <option value="">Select a preference</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>

            </select>
          </div>

          {/* Continue Button */}
          <button
            className="mt-6 bg-[#0A4A45] hover:bg-[#083a36] text-white py-4 text-lg rounded-full transition-all"
            onClick={() => router.push("/plan/customisations")}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}