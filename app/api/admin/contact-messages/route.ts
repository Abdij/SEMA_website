import { NextResponse } from "next/server";
import { AdminUnauthorizedError, requireAdminAuth, unauthorizedResponse } from "@/lib/admin";
import { getContactMessages, updateContactMessageStatus } from "@/lib/db";

function serverErrorResponse(error: unknown) {
  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Internal server error" },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    requireAdminAuth(request);
    const messages = await getContactMessages();
    return NextResponse.json(messages);
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    requireAdminAuth(request);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    const body = await request.json();
    const status = typeof body.status === "string" ? body.status : "";
    if (!status) {
      return NextResponse.json({ message: "Missing status" }, { status: 400 });
    }

    const updated = await updateContactMessageStatus(id, status);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}
