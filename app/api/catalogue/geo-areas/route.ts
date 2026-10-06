import { NextResponse } from "next/server";
import { getCatalogueGeoAreas } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const level = url.searchParams.get("level") || undefined;
  const parentId = url.searchParams.get("parentId") || undefined;

  const areas = await getCatalogueGeoAreas(level, parentId);
  return NextResponse.json(areas);
}
