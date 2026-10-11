import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIdentifier } from "@/lib/analytics-server";
import { enforceRateLimit, readLimitedJson, requireSameOrigin, securityResponse } from "@/lib/security";
import { matchFaq } from "@/lib/chatbot-faq";

const bodySchema = z.object({
  message: z.string().trim().min(1).max(1000),
}).strict();

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    await enforceRateLimit("chat", getClientIdentifier(request), 20, 600);

    const body = await readLimitedJson(request, 8192);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Please enter a message." }, { status: 400 });
    }

    // Deliberately stateless: no transcript storage, session IDs or AI provider.
    return NextResponse.json(matchFaq(parsed.data.message), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return (
      securityResponse(error) ||
      NextResponse.json({ message: "The assistant is temporarily unavailable. Please try again later." }, { status: 503 })
    );
  }
}
