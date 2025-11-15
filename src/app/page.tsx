import Image from "next/image";
import { SupabaseExample } from "@/components/supabase-example";

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
            Next.js + Supabase + Shadcn UI
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Your project is ready! This starter includes Next.js 14 with TypeScript, 
            Supabase for backend services, and Shadcn UI for beautiful components.
          </p>
          <SupabaseExample />
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">Next Steps:</h2>
            <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
              <li>Configure your Supabase credentials in <code className="text-sm bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">.env.local</code></li>
              <li>Install Shadcn components: <code className="text-sm bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">npx shadcn@latest add button</code></li>
              <li>Start building your application!</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://supabase.com/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Supabase Docs
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://ui.shadcn.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shadcn UI
          </a>
        </div>
      </main>
    </div>
  );
}
