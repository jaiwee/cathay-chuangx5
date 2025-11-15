"use client";

import { usePlanForm } from "@/hooks/usePlanForm";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function PurposePage() {
  const router = useRouter();
  const { form, update } = usePlanForm();

  const themes = [
    {
      id: "Sports",
      title: "Sports & Competition Events 🏅",
      desc: "For athletes, teams, and fan experiences",
    },
    {
      id: "Music",
      title: "Entertainment & Concerts 🎤",
      desc: "For tours, festivals, and concerts",
    },
    {
      id: "Media",
      title: "Media & Publicity 📸",
      desc: "For promotional campaigns",
    },
    {
      id: "Corporate",
      title: "Corporate 💼",
      desc: "For professional, incentive, and executive trips",
    },
    {
      id: "Others",
      title: "Others 🌟",
      desc: "For Tourism, Educational, Private Celebrations",
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col px-20 py-8">
      {/* Top Progress Bar */}
      <div className="mb-8">
        <ProgressBar currentStep={1} />
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-2 gap-10 px-8 py-8">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-start pt-10">
          <h1 className="text-[36px] font-semibold text-gray-900">
            What’s the purpose?
          </h1>
          <p className="mt-4 text-gray-600 text-lg leading-relaxed max-w-md">
            Let’s get started by selecting what type of event you wish to plan.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-4">
          {themes.map((t) => {
            const selected = form.theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => update({ theme: t.id })}
                className={`w-full border rounded-2xl p-5 cursor-pointer transition-all ${
                  selected
                    ? "border-[#0A4A45] bg-[#F4FAF9] shadow-sm"
                    : "border-gray-300"
                }`}
              >
                <h3 className="text-lg font-semibold">{t.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{t.desc}</p>
              </div>
            );
          })}

          {/* Continue Button */}
          <button
            className="mt-6 bg-[#0A4A45] hover:bg-[#083a36] text-white py-4 text-lg rounded-full transition-all"
            onClick={() => router.push("/plan/event-details")}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}