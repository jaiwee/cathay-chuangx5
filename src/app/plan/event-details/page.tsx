"use client";

import { usePlanForm } from "@/hooks/usePlanForm";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function EventDetailsPage() {
  const router = useRouter();

  // Zustand store
  const { form, update } = usePlanForm();

  // React Hook Form, prefilled with Zustand values
  const { register, handleSubmit } = useForm({
    defaultValues: {
      event_name: form.event_name || "",
      event_date: form.event_date || "",
      event_time: form.event_time || "",
      event_location: form.event_location || "",
    },
  });

  const onSubmit = (data: any) => {
    update(data); // <--- store new values in Zustand
    router.push("/plan/trip-details"); // Go next
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <ProgressBar currentStep={2} />
      
      <div className="max-w-xl mx-auto flex flex-col gap-6 px-6 py-12">
        <h1 className="text-3xl font-semibold">Event Details</h1>
      <p className="text-gray-600">
        Tell us more about the event you are planning.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Event Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Event Name</label>
          <input
            {...register("event_name")}
            className="border p-3 rounded-xl bg-white"
            placeholder="Enter event name"
          />
        </div>

        {/* Event Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Event Date</label>
          <input
            type="date"
            {...register("event_date")}
            className="border p-3 rounded-xl bg-white"
          />
        </div>

        {/* Event Time */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Event Time</label>
          <input
            type="time"
            {...register("event_time")}
            className="border p-3 rounded-xl bg-white"
          />
        </div>

        {/* Event Location */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Event Location</label>
          <input
            {...register("event_location")}
            className="border p-3 rounded-xl bg-white"
            placeholder="e.g., Hong Kong Coliseum"
          />
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          className="mt-4 bg-[#0A4A45] text-white py-4 rounded-full text-lg hover:bg-[#083a36]"
        >
          Continue
        </button>
      </form>
      </div>
    </div>
  );
}