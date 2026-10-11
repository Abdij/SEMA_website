import { z } from "zod";
import { SecurityError } from "@/lib/security";
import { NextResponse } from "next/server";
import { requireAdminAuth, unauthorizedResponse } from "@/lib/admin";
import { getChatSessionMessages, listChatSessionsForAdmin } from "@/lib/db";

function serverErrorResponse() {
  return NextResponse.json(
    { message: "Unable to load chat logs." },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    await requireAdminAuth(request);
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");

    if (sessionId) {
      if (!z.string().uuid().safeParse(sessionId).success) return NextResponse.json({ message: "Invalid session." }, { status: 400 });
      const messages = await getChatSessionMessages(sessionId);
      return NextResponse.json(messages, { headers: { "Cache-Control": "no-store" } });
    }

    const limit = Number(url.searchParams.get("limit") ?? 50);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 200 || !Number.isSafeInteger(offset) || offset < 0) {
      return NextResponse.json({ message: "Invalid pagination." }, { status: 400 });
    }
    const sessions = await listChatSessionsForAdmin(limit, offset);
    return NextResponse.json(sessions, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SecurityError) {
      return unauthorizedResponse(error);
    }
    return serverErrorResponse();
  }
}
