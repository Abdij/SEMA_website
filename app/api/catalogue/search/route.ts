import { NextResponse } from "next/server";
import { searchCatalogueLocations } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";

  if (query.trim().length < 2) {
    return NextResponse.json([]);
  }

  const results = await searchCatalogueLocations(query);
  return NextResponse.json(results);
}
