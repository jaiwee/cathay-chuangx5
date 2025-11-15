"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type Role = "user" | "assistant";
interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
}

interface AiChatProps {
  className?: string;
  heading?: string;
  placeholder?: string;
}

export function AiChat({
  className,
  heading = "Ask Catherine our AI Consultant",
  placeholder = "Ask me questions or make edits to your proposal",
}: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Certainly! I can help you refine or edit your itinerary.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10),
          assistantName: "Catherine",
        }),
      });

      let reply = "Sorry, I couldn’t process that request.";
      if (res.ok) {
        const data = await res.json();
        reply = data.message ?? reply;
      }

      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: "I hit an error. Please retry.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div
      className={`h-full flex flex-col rounded-lg border border-zinc-200 bg-white/70 backdrop-blur p-6 dark:border-zinc-800 dark:bg-zinc-900/60 overflow-hidden ${className ?? ""}`}
    >
      <div className="mb-4 flex justify-center flex-shrink-0">
        <h2 className="text-sm font-medium tracking-wide text-zinc-700 dark:text-zinc-200">
          {heading}
        </h2>
      </div>
      <Separator className="mb-4 flex-shrink-0" />

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-5 pr-2">
          {messages.map((m) => (
            <ChatLine key={m.id} message={m} />
          ))}
          {isSending && (
            <ChatLine
              loading
              message={{
                id: "loading",
                role: "assistant",
                content: "Typing…",
                timestamp: new Date().toISOString(),
              }}
            />
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="mt-6 relative flex items-center flex-shrink-0"
      >
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

function ChatLine({
  message,
  loading,
}: {
  message: Message;
  loading?: boolean;
}) {
  const isUser = message.role === "user";
  const label = isUser ? "YOU" : "CATHERINE";
  return (
    <div
      className={`flex flex-col ${isUser ? "items-end" : "items-start"} text-[11px]`}
    >
      <span
        className={`mb-1 font-medium tracking-wide ${
          isUser
            ? "text-zinc-600 dark:text-zinc-300"
            : "text-purple-700 dark:text-purple-300"
        }`}
      >
        {label}
      </span>
      <div
        className={`max-w-[340px] rounded-md bg-zinc-100 px-3 py-2 leading-relaxed dark:bg-zinc-800 ${
          isUser
            ? "text-zinc-800 dark:text-zinc-100"
            : "text-zinc-800 dark:text-zinc-100"
        }`}
      >
        {loading ? (
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" />
          </span>
        ) : (
          <span className="whitespace-pre-wrap break-words text-[12px]">
            {message.content}
          </span>
        )}
      </div>
    </div>
  );
}