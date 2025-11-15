"use client";

import { usePlanForm } from "@/hooks/usePlanForm";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function TripDetailsPage() {
  const router = useRouter();
  const { form, update } = usePlanForm();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      origin_country: form.origin_country || "",
      destination_country: form.destination_country || "",
      time_pref: form.time_pref || "",
      group_size: form.group_size || "",
    },
  });

  const onSubmit = (data: any) => {
    update(data);
    router.push("/plan/customisations");
  };

  return (
    <div className="min-h-screen w-full flex flex-col px-16 py-12">
      {/* Progress Bar */}
      <ProgressBar currentStep={3} />

      <div className="max-w-xl mt-12">
        <h1 className="text-[32px] font-semibold text-gray-900">
          Trip Details
        </h1>
        <p className="mt-3 text-gray-600 text-lg leading-relaxed">
          Tell us where your journey will begin and where you're headed.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-8">

          {/* Origin Country */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Origin Country</label>
            <input
              {...register("origin_country")}
              placeholder="e.g., Hong Kong"
              className="border p-3 rounded-xl bg-white"
            />
          </div>

          {/* Destination Country */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Destination Country</label>
            <input
              {...register("destination_country")}
              placeholder="e.g., Japan"
              className="border p-3 rounded-xl bg-white"
            />
          </div>

          {/* Flight Timing Preference */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Preferred Flight Timing</label>
            <select
              {...register("time_pref")}
              className="border p-3 rounded-xl bg-white"
            >
              <option value="">Select a preference</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Overnight">Overnight</option>
            </select>
          </div>

          {/* Group Size */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Group Size</label>
            <input
              type="number"
              {...register("group_size")}
              placeholder="e.g., 25"
              className="border p-3 rounded-xl bg-white"
            />
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="mt-4 bg-[#0A4A45] hover:bg-[#083a36] text-white py-4 text-lg rounded-full transition-all"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}