import { NextResponse } from "next/server";
import { getCatalogueDistrictProfile, getCatalogueGeoAreaBySlug, getCatalogueRegionProfile } from "@/lib/db";

type RouteParams = { params: Promise<{ slug: string }> };

/**
 * Used by the map's district click panel and by settlement search results
 * (which resolve to their parent district). Returns availability metadata
 * only -- never raw IMSMA records or exact hazard coordinates.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const area = await getCatalogueGeoAreaBySlug(slug);

  if (!area) {
    return NextResponse.json({ message: "Location not found" }, { status: 404 });
  }

  if (area.level === "district") {
    const profile = await getCatalogueDistrictProfile(slug);
    return NextResponse.json(profile);
  }

  if (area.level === "region") {
    const profile = await getCatalogueRegionProfile(slug);
    return NextResponse.json(profile);
  }

  return NextResponse.json({ area });
}
