import { AiChat } from "@/components/ui/ai-chat";
import { ProposalForm } from "@/components/ui/proposal-form";

export default function ProposalFormPage() {
  return (
    <div className="h-screen bg-zinc-50 dark:bg-black overflow-hidden">
      <div className="h-full mx-auto max-w-6xl p-6 md:p-10">
        <div className="h-full grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-full flex flex-col rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <ProposalForm />
          </div>

          <div className="h-full flex flex-col rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50 flex-shrink-0">Catherine AI</h2>
            <div className="flex-1 min-h-0">
              <AiChat />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}