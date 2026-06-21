import { NextResponse } from "next/server";
import { AdminUnauthorizedError, requireAdminAuth, unauthorizedResponse } from "@/lib/admin";
import { createPublication, deletePublication, getAdminPublications, updatePublication } from "@/lib/db";

function serverErrorResponse(error: unknown) {
  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Internal server error" },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    requireAdminAuth(request);
    const publications = await getAdminPublications();
    return NextResponse.json(publications);
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireAdminAuth(request);
    const body = await request.json();
    const created = await createPublication(body);
    return NextResponse.json(created);
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
    const title = url.searchParams.get("title");
    const body = await request.json();

    if (!title) {
      return NextResponse.json({ message: "Missing title" }, { status: 400 });
    }

    const updated = await updatePublication(title, body);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    requireAdminAuth(request);
    const url = new URL(request.url);
    const title = url.searchParams.get("title");

    if (!title) {
      return NextResponse.json({ message: "Missing title" }, { status: 400 });
    }

    await deletePublication(title);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}
