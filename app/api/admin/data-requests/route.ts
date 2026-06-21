import { NextResponse } from "next/server";
import { AdminUnauthorizedError, requireAdminAuth, unauthorizedResponse } from "@/lib/admin";
import { getDataRequests, updateDataRequestStatus } from "@/lib/db";

function serverErrorResponse(error: unknown) {
  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Internal server error" },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    requireAdminAuth(request);
    const requests = await getDataRequests();
    return NextResponse.json(requests);
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
    const status = typeof body.status === "string" ? body.status : undefined;
    const sensitivityLevel = typeof body.sensitivityLevel === "string" ? body.sensitivityLevel : undefined;
    const note = typeof body.note === "string" ? body.note : undefined;
    const changedBy = typeof body.changedBy === "string" ? body.changedBy : undefined;

    const updated = await updateDataRequestStatus(id, status, sensitivityLevel, note, changedBy);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}
