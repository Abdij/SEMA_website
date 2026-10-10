import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIdentifier } from "@/lib/analytics-server";
import { enforceRateLimit, readLimitedJson, requireSameOrigin, securityResponse } from "@/lib/security";
import {
  createChatSession,
  getRecentChatMessages,
  insertChatMessage,
  touchChatSession,
} from "@/lib/db";
import { CHATBOT_SYSTEM_PROMPT } from "@/lib/chatbot-knowledge";

const DEFAULT_MODEL = "meta-llama/Llama-3.1-8B-Instruct";
const REQUEST_TIMEOUT_MS = 15000;

const bodySchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(1000),
});

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    await enforceRateLimit("chat", getClientIdentifier(request), 20, 600);

    const body = await readLimitedJson(request);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Please enter a message." }, { status: 400 });
    }

    const sessionId = parsed.data.sessionId || (await createChatSession());
    const priorTurns = await getRecentChatMessages(sessionId, 10);
    await insertChatMessage(sessionId, "user", parsed.data.message);

    const reply = await askChatModel(priorTurns, parsed.data.message);
    await insertChatMessage(sessionId, "assistant", reply);
    await touchChatSession(sessionId);

    return NextResponse.json({ sessionId, reply });
  } catch (error) {
    return (
      securityResponse(error) ||
      NextResponse.json({ message: "The assistant is temporarily unavailable. Please try again later." }, { status: 503 })
    );
  }
}

async function askChatModel(
  priorTurns: { role: "user" | "assistant"; content: string }[],
  message: string,
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error("Chat model is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.HUGGINGFACE_CHAT_MODEL || DEFAULT_MODEL,
        messages: [
          { role: "system", content: CHATBOT_SYSTEM_PROMPT },
          ...priorTurns.map((turn) => ({ role: turn.role, content: turn.content })),
          { role: "user", content: message },
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Chat model request failed (${response.status})`);
    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) throw new Error("Chat model returned an empty reply");
    return reply.trim();
  } finally {
    clearTimeout(timeout);
  }
}
