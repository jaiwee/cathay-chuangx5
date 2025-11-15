"use client";

import { useEffect, useState } from "react";
import { AiChat } from "@/components/ui/ai-chat";
import { ProposalForm } from "@/components/ui/proposal-form";
import Lottie from "lottie-react";
import airplaneAnim from "@/public/animations/Flight.json";
import foodAnim from "@/public/animations/Food.json";
import hotelAnim from "@/public/animations/Home.json";
import transportAnim from "@/public/animations/Car.json";
import entertainmentAnim from "@/public/animations/Popcorn.json";
import wineAnim from "@/public/animations/Wine.json";

export default function ProposalFormPage() {
  const [isGenerating, setIsGenerating] = useState(true);
  const [stage, setStage] = useState(0);

  const stages = [
    { data: airplaneAnim, label: "Planning your flights" },
    { data: foodAnim, label: "Selecting dining experiences" },
    { data: wineAnim, label: "Selecting dining experiences" },
    { data: entertainmentAnim, label: "Curating in-flight activities"},
    { data: hotelAnim, label: "Finding accommodations" },
    { data: transportAnim, label: "Arranging ground transport" },
  ];

  useEffect(() => {
    // Simulate AI pipeline generation
    // Replace with your actual API call
    const generateProposal = async () => {
      try {
        // Example: await fetch('/api/generate-proposal');
        await new Promise(resolve => setTimeout(resolve, 6000000)); // Simulated delay
        setIsGenerating(false);
      } catch (error) {
        console.error("Failed to generate proposal:", error);
        setIsGenerating(false);
      }
    };

    const id = setInterval(() => setStage((s) => (s + 1) % stages.length), 3000);
    generateProposal();
    return () => clearInterval(id);
  }, []);

  if (isGenerating) {
    return (
      <div className="h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Animation container with fixed size */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
            {stages.map((s, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ${i === stage ? "opacity-100" : "opacity-0"}`}
              >
                <Lottie animationData={s.data} loop autoplay />
              </div>
            ))}
          </div>

          {/* Text below animation */}
          <div className="text-center">
            <h2 className="text-xl md:text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 text-center">
              Generating Your Proposal
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400">
              {stages[stage].label}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            {stages.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === stage
                    ? "w-6 bg-[#014A43] dark:bg-zinc-400"
                    : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-50 dark:bg-black overflow-hidden">
      <div className="h-full mx-auto max-w-6xl p-6 md:p-10">
        <div className="h-full grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-full flex flex-col rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <ProposalForm />
          </div>

          <div className="h-full flex flex-col rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex-1 min-h-0">
              <AiChat className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}