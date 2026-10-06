import { NextResponse } from "next/server";
import { AdminUnauthorizedError, requireAdminAuth, unauthorizedResponse } from "@/lib/admin";
import { createCatalogueDataset, deleteCatalogueDataset, getAdminCatalogueDatasets, updateCatalogueDataset } from "@/lib/db";

function serverErrorResponse(error: unknown) {
  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Internal server error" },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    requireAdminAuth(request);
    const datasets = await getAdminCatalogueDatasets();
    return NextResponse.json(datasets);
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireAdminAuth(request);
    const body = await request.json();
    const created = await createCatalogueDataset(body);
    return NextResponse.json(created);
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    requireAdminAuth(request);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    const updated = await updateCatalogueDataset(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    requireAdminAuth(request);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    await deleteCatalogueDataset(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
