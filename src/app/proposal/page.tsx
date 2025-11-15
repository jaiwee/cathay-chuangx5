import { AiChat } from "@/components/ui/ai-chat";
import { ProposalForm } from "@/components/ui/proposal-form";

export default function ProposalFormPage() {
  return (
    <div className="h-screen overflow-hidden bg-zinc-50 dark:bg-black flex flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-col p-6 md:p-10 flex-1">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Proposal Builder
        </h1>

        <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 overflow-hidden">
          <div className="flex flex-col h-full rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Details
            </h2>
            <div className="flex-1 overflow-y-auto pr-2">
              <ProposalForm />
            </div>
          </div>

          <div className="flex flex-col h-full rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Catherine AI
            </h2>
            <div className="flex-1 overflow-y-auto pr-2">
              <AiChat className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}