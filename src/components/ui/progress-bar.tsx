interface ProgressBarProps {
  currentStep: number; // 1-5
  totalSteps?: number;
}

export function ProgressBar({ currentStep, totalSteps = 5 }: ProgressBarProps) {
  const progressWidth = `${(currentStep / totalSteps) * 100}%`;

  return (
    <div className="w-full h-2 bg-gray-200 dark:bg-zinc-800">
      <div
        className="h-full bg-[#0A4A45] rounded-r-full transition-all duration-300"
        style={{ width: progressWidth }}
      />
    </div>
  );
}
