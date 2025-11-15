import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const runtime = "edge";

export async function POST(req: Request) {
  const { message, history = [], assistantName = "Catherine" } = await req.json();

  // Build a messages array compatible with the AI SDK
  const messages = [
    ...history,
    { role: "user", content: message },
  ];

  const result = await generateText({
    model: google("gemini-2.0-flash"),
    system: `You are ${assistantName} AI, a concise, friendly Cathay Pacific proposal consultant.`,
    messages,
  });

  return new Response(JSON.stringify({ message: result.text }), {
    headers: { "Content-Type": "application/json" },
  });
}