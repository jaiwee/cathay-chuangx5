"use client";

import { usePlanForm } from "@/hooks/usePlanForm";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function CustomisationsPage() {
  const router = useRouter();
  const { form, update } = usePlanForm();

  return (
    <div className="h-screen w-full flex flex-col px-20 py-8 overflow-hidden">
      {/* Top Progress Bar */}
      <div className="mb-8 flex-shrink-0">
        <ProgressBar currentStep={4} />
      </div>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-2 gap-10 px-8 overflow-hidden">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center">
          <h1 className="text-[36px] font-semibold text-gray-900">
            Inflight Customisations
          </h1>
          <p className="mt-4 text-gray-600 text-lg leading-relaxed max-w-md">
            Personalise your experience with curated options from Cathay Shop.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-center gap-6">
          {/* Entertainment */}
          <div
            onClick={() => update({ hasEntertainment: !form.hasEntertainment })}
            className={`cursor-pointer border rounded-2xl p-5 transition-all flex items-start gap-4 ${
              form.hasEntertainment
                ? "border-[#0A4A45] bg-[#F4FAF9]"
                : "border-gray-300"
            }`}
          >
            <input
              type="checkbox"
              checked={form.hasEntertainment || false}
              onChange={() => {}}
              className="mt-1 w-5 h-5 accent-[#0A4A45] cursor-pointer flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Entertainment</h3>
              <p className="text-sm text-gray-600 mt-1">
                Lighting, onboard events, music & videography/photography
              </p>
            </div>
          </div>

          {/* Merchandise */}
          <div
            onClick={() => update({ hasMerch: !form.hasMerch })}
            className={`cursor-pointer border rounded-2xl p-5 transition-all flex items-start gap-4 ${
              form.hasMerch
                ? "border-[#0A4A45] bg-[#F4FAF9]"
                : "border-gray-300"
            }`}
          >
            <input
              type="checkbox"
              checked={form.hasMerch || false}
              onChange={() => {}}
              className="mt-1 w-5 h-5 accent-[#0A4A45] cursor-pointer flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Merchandise</h3>
              <p className="text-sm text-gray-600 mt-1">
                Sports merch, beauty kits & exclusive Cathay items
              </p>
            </div>
          </div>

          {/* Culinary */}
          <div
            onClick={() => update({ hasCulinary: !form.hasCulinary })}
            className={`cursor-pointer border rounded-2xl p-5 transition-all flex items-start gap-4 ${
              form.hasCulinary
                ? "border-[#0A4A45] bg-[#F4FAF9]"
                : "border-gray-300"
            }`}
          >
            <input
              type="checkbox"
              checked={form.hasCulinary || false}
              onChange={() => {}}
              className="mt-1 w-5 h-5 accent-[#0A4A45] cursor-pointer flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Culinary Experience</h3>
              <p className="text-sm text-gray-600 mt-1">
                Dining experience upgrades, regional cuisine, curated menus
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <button
            className="mt-6 bg-[#0A4A45] hover:bg-[#083a36] text-white py-4 text-lg rounded-full transition-all"
            onClick={() => router.push("/review")}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}