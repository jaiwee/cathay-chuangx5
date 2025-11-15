"use client";

import { usePlanForm } from "@/hooks/usePlanForm";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/progress-bar";

// Countries where Cathay Pacific operates
const CATHAY_COUNTRIES = [
  "Australia",
  "Bangladesh",
  "Cambodia",
  "Canada",
  "China",
  "France",
  "Germany",
  "Hong Kong",
  "India",
  "Indonesia",
  "Italy",
  "Japan",
  "Malaysia",
  "Maldives",
  "Nepal",
  "New Zealand",
  "Philippines",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Vietnam",
];

export default function TripDetailsPage() {
  const router = useRouter();
  const { form, update } = usePlanForm();

  return (
    <div className="h-screen w-full flex flex-col px-20 py-8 overflow-hidden">
      {/* Top Progress Bar */}
      <div className="mb-8 flex-shrink-0">
        <ProgressBar currentStep={3} />
      </div>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-2 gap-10 px-8 overflow-hidden">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center">
          <h1 className="text-[36px] font-semibold text-gray-900">
            Trip Details
          </h1>
          <p className="mt-4 text-gray-600 text-lg leading-relaxed max-w-md">
            Provide details about your trip to help us plan your journey.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-center gap-6">
          {/* Origin Country */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Origin Country
            </label>
            <select
              value={form.origin_country || ""}
              onChange={(e) => update({ origin_country: e.target.value })}
              className="mt-1 p-3 border rounded-lg text-gray-900 bg-white"
            >
              <option value="">Select origin country</option>
              {CATHAY_COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Country */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Destination Country
            </label>
            <select
              value={form.destination_country || ""}
              onChange={(e) => update({ destination_country: e.target.value })}
              className="mt-1 p-3 border rounded-lg text-gray-900 bg-white"
            >
              <option value="">Select destination country</option>
              {CATHAY_COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Group Size */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Group Size
            </label>
            <input
              type="number"
              min="1"
              value={form.group_size || ""}
              onChange={(e) => update({ group_size: parseInt(e.target.value) || 0 })}
              className="mt-1 p-3 border rounded-lg text-gray-900"
              placeholder="Enter number of travelers"
            />
          </div>

          {/* Flight Timing Preference */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Preferred Flight Timing
            </label>
            <select
              value={form.time_pref || ""}
              onChange={(e) => update({ time_pref: e.target.value })}
              className="mt-1 p-3 border rounded-lg text-gray-900 bg-white"
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
            onClick={() => router.push("/customisations")}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}