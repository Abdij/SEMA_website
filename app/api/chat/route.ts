import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIdentifier } from "@/lib/analytics-server";
import { enforceRateLimit, readLimitedJson, requireSameOrigin, securityResponse } from "@/lib/security";
import { createChatSession, insertChatMessage, touchChatSession } from "@/lib/db";
import { matchFaqAnswer } from "@/lib/chatbot-faq";

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
    await insertChatMessage(sessionId, "user", parsed.data.message);

    const reply = matchFaqAnswer(parsed.data.message);
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
