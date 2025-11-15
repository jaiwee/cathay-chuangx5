import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            AI Flight Pipeline
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            AI-powered flight recommendation system using Next.js, Google Gemini, and Shadcn UI.
          </p>
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">Try the Pipeline:</h2>
            <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
              <li>Visit <a href="/pipeline" className="text-blue-600 dark:text-blue-400 hover:underline">/pipeline</a> to generate flight recommendations</li>
              <li>Enter event details and travel preferences</li>
              <li>Get AI-powered flight suggestions powered by Gemini 2.5 Flash</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[200px]"
            href="/pipeline"
          >
            Try Flight Pipeline
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/8 px-5 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[200px]"
            href="https://ai.google.dev/gemini-api/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gemini AI Docs
          </a>
        </div>
      </main>
    </div>
  );
}
