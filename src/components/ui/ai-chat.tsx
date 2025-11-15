"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string };

export function AiChat({
  className,
  heading = "Ask Catherine our AI Consultant",
  placeholder = "Ask me questions or make edits to your proposal",
}: {
  className?: string;
  heading?: string;
  placeholder?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "Certainly! I can help you refine or edit your itinerary." },
  ]);
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
    <div className={`flex flex-col rounded-lg border border-zinc-200 bg-white/70 backdrop-blur p-6 dark:border-zinc-800 dark:bg-zinc-900/60 ${className ?? ""}`}>
      <div className="mb-4 flex justify-center">
        <h2 className="text-sm font-medium tracking-wide text-zinc-700 dark:text-zinc-200">{heading}</h2>
      </div>
      <Separator className="mb-4" />

      <ScrollArea className="flex-1">
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
          className="pr-12 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={isSending || !input.trim()}
          className="absolute right-1 top-1 h-8 w-8 rounded-md text-xs font-medium"
          aria-label="Send"
        >
          ➤
        </Button>
      </form>
    </div>
  );
}

function ChatLine({ role, content, loading }: { role: Role; content: string; loading?: boolean }) {
  const isUser = role === "user";
  const label = isUser ? "YOU" : "CATHERINE";
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} text-[11px]`}>
      <span className={`mb-1 font-medium tracking-wide ${isUser ? "text-zinc-600 dark:text-zinc-300" : "text-purple-700 dark:text-purple-300"}`}>{label}</span>
      <div className={`max-w-[340px] rounded-md bg-zinc-100 px-3 py-2 leading-relaxed dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100`}>
        {loading ? (
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" />
          </span>
        ) : (
          <span className="whitespace-pre-wrap break-words text-[12px]">{content}</span>
        )}
      </div>
    </div>
  );
}