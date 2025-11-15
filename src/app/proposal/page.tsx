"use client";

import { useEffect, useState } from "react";
import { AiChat } from "@/components/ui/ai-chat";
import { ProposalForm } from "@/components/ui/proposal-form";
import { Loader2 } from "lucide-react";

export default function ProposalFormPage() {
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    // Simulate AI pipeline generation
    // Replace with your actual API call
    const generateProposal = async () => {
      try {
        // Example: await fetch('/api/generate-proposal');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
        setIsGenerating(false);
      } catch (error) {
        console.error("Failed to generate proposal:", error);
        setIsGenerating(false);
      }
    };

    generateProposal();
  }, []);

  if (isGenerating) {
    return (
      <div className="h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Generating Your Proposal
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Catherine AI is preparing your event flight proposal...
            </p>
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