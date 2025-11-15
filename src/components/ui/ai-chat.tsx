"use client";
import ReactMarkdown from "react-markdown";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, SendHorizontal } from "lucide-react";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string };

export function AiChat({
  className,
  heading = "Ask Catherine our AI Consultant",
  placeholder = "Ask me questions about event flight planning",
}: {
  className?: string;
  heading?: string;
  placeholder?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, isSending]);

  const send = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map(({ role, content }) => ({ role, content })),
          assistantName: "Catherine AI",
        }),
      });
      const data = await res.json();
      const reply = typeof data?.message === "string" ? data.message : "Sorry, something went wrong.";
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { id: `e-${Date.now()}`, role: "assistant", content: "I hit an error. Please retry." }]);
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send();
  };

  return (
    <div
      className={`relative overflow-hidden flex flex-col rounded-lg bg-transparent backdrop-blur p-6 ${className ?? ""}`}
    >
      {/*gradient circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10
                   bg-[radial-gradient(circle_at_50%_60%,rgba(236,72,153,0.25)_0%,rgba(168,85,247,0.20)_30%,transparent_60%)]
                   dark:bg-[radial-gradient(circle_at_50%_60%,rgba(236,72,153,0.30)_0%,rgba(168,85,247,0.25)_30%,transparent_60%)]"
      />

      <div className="mb-6 flex flex-col items-center gap-3">
        <Sparkles className="h-6 w-6 text-zinc-700 dark:text-zinc-200" aria-hidden="true" />
        <h2 className="text-xl md:text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 text-center">
          {heading}
        </h2>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-5 pr-2">
          {messages.map((m) => (
            <ChatLine key={m.id} role={m.role} content={m.content} />
          ))}
          {isSending && <ChatLine role="assistant" content="Typing…" loading />}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <form onSubmit={onSubmit} className="mt-6 relative flex items-center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          aria-label="Message Catherine AI"
          disabled={isSending}
          className="pr-12 text-sm border border-white dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 rounded-md shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={isSending || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-700"
          aria-label="Send"
        >
          <SendHorizontal className="h-4 w-4 " />
        </Button>
      </form>
    </div>
  );
}

function ChatLine({ role, content, loading }: { role: Role; content: string; loading?: boolean }) {
  const isUser = role === "user";
  const label = isUser ? "YOU" : "CATHERINE";
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} text-xs`}>
      <span className={`mb-1 font-medium tracking-wide ${isUser ? "text-zinc-600 dark:text-zinc-300" : "text-[#014A43] dark:text-[#5E967E]"}`}>
        {label}
      </span>
      <div className={`max-w-[340px] border rounded-md border-white/50 dark:border-zinc-700/50 bg-zinc-100/50 px-3 py-2 leading-relaxed dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100`}>
        {loading ? (
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" />
          </span>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}