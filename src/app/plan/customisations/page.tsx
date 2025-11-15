"use client";

import { usePlanForm } from "@/hooks/usePlanForm";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function CustomisationsPage() {
  const router = useRouter();
  const { form, update } = usePlanForm();

  return (
    <div className="min-h-screen w-full flex flex-col px-16 py-12">
      {/* Progress Bar */}
      <ProgressBar currentStep={4} />

      <div className="max-w-xl mt-12">
        <h1 className="text-[32px] font-semibold text-gray-900">
          What inflight customisation do you want?
        </h1>
        <p className="mt-3 text-gray-600 text-lg leading-relaxed">
          Personalise your experience with curated options from Cathay Shop.
        </p>

        <div className="flex flex-col gap-6 mt-10">

          {/* Entertainment */}
          <div
            onClick={() => update({ entertainment: !form.entertainment })}
            className={`cursor-pointer border rounded-2xl p-5 transition-all ${
              form.entertainment
                ? "border-[#0A4A45] bg-[#F4FAF9]"
                : "border-gray-300"
            }`}
          >
            <h3 className="text-lg font-semibold">Entertainment</h3>
            <p className="text-sm text-gray-600 mt-1">
              Lighting, onboard events, music & videography/photography
            </p>
          </div>

          {/* Merchandise */}
          <div
            onClick={() => update({ merch: !form.merch })}
            className={`cursor-pointer border rounded-2xl p-5 transition-all ${
              form.merch
                ? "border-[#0A4A45] bg-[#F4FAF9]"
                : "border-gray-300"
            }`}
          >
            <h3 className="text-lg font-semibold">Merchandise</h3>
            <p className="text-sm text-gray-600 mt-1">
              Sports merch, beauty kits & exclusive Cathay items
            </p>
          </div>

          {/* Culinary */}
          <div
            onClick={() => update({ culinary: !form.culinary })}
            className={`cursor-pointer border rounded-2xl p-5 transition-all ${
              form.culinary
                ? "border-[#0A4A45] bg-[#F4FAF9]"
                : "border-gray-300"
            }`}
          >
            <h3 className="text-lg font-semibold">Culinary Experience</h3>
            <p className="text-sm text-gray-600 mt-1">
              Dining experience upgrades, regional cuisine, curated menus
            </p>
          </div>

          {/* Continue */}
          <button
            className="mt-6 bg-[#0A4A45] hover:bg-[#083a36] text-white py-4 text-lg rounded-full transition-all"
            onClick={() => router.push("/plan/review")}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}