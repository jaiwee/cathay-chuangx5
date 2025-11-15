"use client";

import { usePlanForm } from "@/hooks/usePlanForm";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useState } from "react";

export default function EventDetailsPage() {
  const router = useRouter();
  const { form, update } = usePlanForm();
  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch location suggestions from Nominatim (OpenStreetMap)
  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching location:", error);
      setSuggestions([]);
    }
    setLoading(false);
  };

  const handleLocationSelect = (location: any) => {
    const address = location.display_name;
    update({ event_location: address });
    setLocationQuery(address);
    setSuggestions([]);
  };

  const handleLocationChange = (value: string) => {
    setLocationQuery(value);
    update({ event_location: value });
    searchLocation(value);
  };

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

          {/* Event Location - with autocomplete */}
          <div className="flex flex-col relative">
            <label className="text-sm font-medium text-gray-700">
              Event Location
            </label>
            <input
              type="text"
              value={locationQuery || form.event_location || ""}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => {
                if (form.event_location) {
                  setLocationQuery(form.event_location);
                }
              }}
              className="mt-1 p-3 border rounded-lg text-gray-900"
              placeholder="Enter event address or location"
            />
            
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {loading && (
                  <div className="p-3 text-sm text-gray-500">Loading...</div>
                )}
                {suggestions.map((location, index) => (
                  <div
                    key={index}
                    onClick={() => handleLocationSelect(location)}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  >
                    <p className="text-sm text-gray-900 font-medium">
                      {location.name || location.display_name.split(',')[0]}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {location.display_name}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              Start typing to see address suggestions
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