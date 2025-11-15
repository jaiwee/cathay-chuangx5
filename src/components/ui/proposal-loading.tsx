"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

// You'll need to download these from LottieFiles.com or similar
// Place them in public/animations/
const animations = [
  { file: "/animations/flight.json", label: "Planning your flights" },
  { file: "/animations/food.json", label: "Selecting dining experiences" },
  { file: "/animations/hotel.json", label: "Finding accommodations" },
  { file: "/animations/transport.json", label: "Arranging ground transport" },
];

export function ProposalLoading() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % animations.length);
    }, 3000); // Change animation every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-zinc-50 via-purple-50/30 to-pink-50/30 dark:from-black dark:via-purple-950/20 dark:to-pink-950/20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        {/* Animation container with fade transition */}
        <div className="relative w-64 h-64">
          {animations.map((anim, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Lottie
                animationData={require(`../../../public${anim.file}`)}
                loop
                autoplay
              />
            </div>
          ))}
        </div>

        {/* Text content */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Generating Your Proposal
          </h2>
          <p
            key={currentIndex}
            className="text-base text-zinc-600 dark:text-zinc-400 animate-fade-in"
          >
            {animations[currentIndex].label}
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex gap-2">
          {animations.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentIndex
                  ? "w-8 bg-purple-600 dark:bg-purple-400"
                  : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}