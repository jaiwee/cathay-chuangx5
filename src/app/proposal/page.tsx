"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePlanForm } from "@/hooks/usePlanForm";
import { AiChat } from "@/components/ui/ai-chat";
import { ProposalForm } from "@/components/ui/proposal-form";
import Lottie from "lottie-react";

// Helper to normalize event_location to { country: string, address: string }
function normalizeEventLocation(raw: any, fallbackCountry?: string) {
  if (!raw) return { country: fallbackCountry || "", address: "" };

  // If it's already an object with country and address
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return {
      country: String(raw.country || fallbackCountry || ""),
      address: String(raw.address || raw.display_name || ""),
    };
  }

  // If it's a string, use it as address
  if (typeof raw === "string") {
    return {
      country: fallbackCountry || "",
      address: raw,
    };
  }

  return { country: fallbackCountry || "", address: "" };
}

// Helper to normalize theme to lowercase
function normalizeTheme(theme?: string): "sports" | "music" | "corporate" {
  const lower = (theme || "").toLowerCase();
  if (lower === "sports") return "sports";
  if (lower === "music" || lower === "entertainment") return "music";
  if (lower === "corporate") return "corporate";
  if (lower === "media") return "music"; // Map Media to music
  if (lower === "others") return "corporate"; // Map Others to corporate
  return "corporate"; // default fallback
}

// Helper to normalize flight timing preference to lowercase
function normalizeFlightTiming(pref?: string): "morning" | "afternoon" | "evening" | undefined {
  const lower = (pref || "").toLowerCase();
  if (lower === "morning") return "morning";
  if (lower === "afternoon") return "afternoon";
  if (lower === "evening") return "evening";
  return undefined;
}

export default function ProposalFormPage() {
  const { form } = usePlanForm();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<any>(null);
  const [anims, setAnims] = useState<null | {
    airplane: any;
    food: any;
    hotel: any;
    transport: any;
    entertainment: any;
    wine: any;
  }>(null);

  const startedRef = useRef(false);

  // Load Lottie JSON from public folder
  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const [airplane, food, hotel, transport, entertainment, wine] = await Promise.all([
          fetch("/animations/Flight.json").then((r) => r.json()),
          fetch("/animations/Food.json").then((r) => r.json()),
          fetch("/animations/Home.json").then((r) => r.json()),
          fetch("/animations/Car.json").then((r) => r.json()),
          fetch("/animations/Popcorn.json").then((r) => r.json()),
          fetch("/animations/Wine.json").then((r) => r.json()),
        ]);
        setAnims({ airplane, food, hotel, transport, entertainment, wine });
      } catch (e) {
        console.error("Failed to load animations from /public:", e);
      }
    };
    loadAnimations();
  }, []);

  const stages = anims
    ? [
        { data: anims.airplane, label: "Planning your flights" },
        { data: anims.food, label: "Selecting dining experiences" },
        { data: anims.wine, label: "Pairing wines and beverages" },
        { data: anims.entertainment, label: "Curating in-flight activities" },
        { data: anims.hotel, label: "Finding accommodations" },
        { data: anims.transport, label: "Arranging ground transport" },
      ]
    : [];

  // Cycle animations only after they are loaded
  useEffect(() => {
    if (!stages.length) return;
    const animId = setInterval(() => {
      setStage((s) => (s + 1) % stages.length);
    }, 5000);
    return () => clearInterval(animId);
  }, [stages.length]);

  // Separate effect for API call
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const planId = searchParams.get("planId");

    const run = async () => {
      try {
        // Check if planId is a valid number for formId lookup
        const isNumericId = !!planId && /^\d+$/.test(planId);
        
        let payload;
        if (isNumericId) {
          // Send formId if it's numeric
          payload = { formId: Number(planId) };
        } else {
          // Build normalized payload from form data
          payload = {
            theme: normalizeTheme(form.theme),
            event_name: String(form.event_name || ""),
            event_date: String(form.event_date || ""),
            event_time: String(form.event_time || ""),
            event_location: normalizeEventLocation(
              (form as any).event_location,
              form.destination_country
            ),
            origin_country: String(form.origin_country || ""),
            destination_country: String(form.destination_country || ""),
            flight_timing_preference: normalizeFlightTiming(form.time_pref),
            group_size: Number(form.group_size) || 1,
          };
        }

        const res = await fetch("/api/pipeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(JSON.stringify(errorData, null, 2));
        }
        
        const data = await res.json();
        setPipeline(data);
      } catch (e: any) {
        console.error("Pipeline error:", e);
        setError(e?.message ?? "Failed to generate proposal");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [form, searchParams]);

  if (loading) {
    return (
      <div className="h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
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
          <div className="text-center">
            <h2 className="text-xl md:text-2xl text-zinc-900 dark:text-zinc-100">
              Generating Your Proposal
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400">
              {stages[stage].label}
            </p>
          </div>
          <div className="flex gap-2">
            {stages.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === stage ? "w-6 bg-[#014A43] dark:bg-zinc-400" : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-center px-6">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-red-600">Failed to generate proposal</h2>
          <pre className="mt-2 text-xs text-left text-zinc-600 bg-zinc-100 p-4 rounded overflow-auto max-h-96">
            {error}
          </pre>
          <button
            className="mt-4 bg-[#0A4A45] hover:bg-[#083a36] text-white py-2 px-4 rounded-full"
            onClick={() => location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-50 dark:bg-black overflow-hidden">
      <div className="h-full mx-auto max-w-6xl p-6 md:p-10">
        <div className="h-full grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-full flex flex-col rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <ProposalForm/>
          </div>
          <div className="h-full flex flex-col rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex-1 min-h-0">
              <AiChat className="h-full"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}