import { SecurityError } from "@/lib/security";
import { NextResponse } from "next/server";
import { requireAdminAuth, unauthorizedResponse } from "@/lib/admin";
import { getChatSessionMessages, listChatSessionsForAdmin } from "@/lib/db";

function serverErrorResponse(error: unknown) {
  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Internal server error" },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    await requireAdminAuth(request);
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");

    if (sessionId) {
      const messages = await getChatSessionMessages(sessionId);
      return NextResponse.json(messages);
    }

    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 50, 1), 200);
    const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);
    const sessions = await listChatSessionsForAdmin(limit, offset);
    return NextResponse.json(sessions);
  } catch (error) {
    if (error instanceof SecurityError) {
      return unauthorizedResponse(error);
    }
    return serverErrorResponse(error);
  }
}
