"use client";

import { useState } from "react";
import { usePlanForm } from "@/hooks/usePlanForm";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function PurposePage() {
  const router = useRouter();
  const { form, update } = usePlanForm();
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

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
    <>
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          onClick={() => setShowWelcomeModal(false)}
        >
          <div
            className="relative flex flex-col items-center justify-center px-24 py-16 rounded-3xl border-1 border-white shadow-2xl animate-in zoom-in duration-1000 slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/cathayx.jpg"
              alt="CathayX Logo"
              className="w-32 h-32 mb-6 object-contain"
            />
            <h1 className="text-4xl font-semibold text-[#00645A] mb-7 text-center">
              Welcome to CathayX
            </h1>
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="mt-4 px-10 py-4 text-lg bg-[#00645A] text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Let&apos;s Take Off
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="h-[100svh] w-full flex flex-col px-12 py-6 overflow-hidden">
        {/* Top Progress Bar */}
        <div className="mb-6 flex-shrink-0">
          <ProgressBar currentStep={1} />
        </div>

        {/* Main layout */}
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-6 px-6 overflow-hidden">
          {/* LEFT SIDE */}
          <div className="flex flex-col justify-center">
            <h1 className="text-[36px] font-semibold text-gray-900">
              What&apos;s the purpose?
            </h1>
            <p className="mt-4 text-gray-600 text-lg leading-relaxed max-w-md">
              Let&apos;s get started by selecting what type of event you wish to
              plan with CathayX.
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col justify-center gap-3 overflow-y-auto pr-2">
            {themes.map((t) => {
              const selected = form.theme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => update({ theme: t.id })}
                  className={`w-full border rounded-2xl p-4 md:p-5 cursor-pointer transition-all ${
                    selected
                      ? "border-[#0A4A45] bg-[#F4FAF9] shadow-sm"
                      : "border-gray-300"
                  }`}
                >
                  <h3 className="text-[clamp(14px,2vh,18px)] font-semibold">
                    {t.title}
                  </h3>
                  <p className="text-[clamp(12px,1.8vh,14px)] text-gray-600 mt-1">
                    {t.desc}
                  </p>
                </div>
              );
            })}

            {/* Continue Button */}
            <button
              className="mt-4 bg-[#0A4A45] hover:bg-[#083a36] text-white py-3 text-[clamp(14px,2vh,16px)] rounded-full transition-all flex-shrink-0"
              onClick={() => router.push("/event-details")}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
