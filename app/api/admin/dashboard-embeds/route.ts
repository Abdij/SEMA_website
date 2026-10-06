import { SecurityError } from "@/lib/security";
import { NextResponse } from "next/server";
import { requireAdminAuth, unauthorizedResponse } from "@/lib/admin";
import { createDashboardEmbed, deleteDashboardEmbed, getAdminDashboardEmbeds, updateDashboardEmbed } from "@/lib/db";

function serverErrorResponse(error: unknown) {
  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Internal server error" },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    await requireAdminAuth(request);
    const dashboards = await getAdminDashboardEmbeds();
    return NextResponse.json(dashboards);
  } catch (error) {
    if (error instanceof SecurityError) {
      return unauthorizedResponse(error);
    }
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminAuth(request);
    const body = await request.json();
    const created = await createDashboardEmbed(body);
    return NextResponse.json(created);
  } catch (error) {
    if (error instanceof SecurityError) {
      return unauthorizedResponse(error);
    }
    return serverErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminAuth(request);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const title = url.searchParams.get("title");
    const body = await request.json();

    if (!id && !title) {
      return NextResponse.json({ message: "Missing dashboard id or title" }, { status: 400 });
    }

    const updated = await updateDashboardEmbed({ id: id || undefined, title: title || undefined }, body);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof SecurityError) {
      return unauthorizedResponse(error);
    }
    return serverErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminAuth(request);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const title = url.searchParams.get("title");

    if (!id && !title) {
      return NextResponse.json({ message: "Missing dashboard id or title" }, { status: 400 });
    }

    await deleteDashboardEmbed({ id: id || undefined, title: title || undefined });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SecurityError) {
      return unauthorizedResponse(error);
    }
    return serverErrorResponse(error);
  }
}
