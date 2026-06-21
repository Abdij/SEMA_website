import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/db";

const allowedEventTypes = new Set(["nav_click", "header_action_click", "dashboard_open"]);

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function cleanMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const eventType = cleanString(body.eventType, 80);

    if (!eventType || !allowedEventTypes.has(eventType)) {
      return NextResponse.json({ message: "Unsupported analytics event" }, { status: 400 });
    }

    await recordAnalyticsEvent({
      eventType,
      label: cleanString(body.label, 200),
      path: cleanString(body.path, 500),
      targetUrl: cleanString(body.targetUrl, 1000),
      metadata: cleanMetadata(body.metadata),
      userAgent: cleanString(request.headers.get("user-agent"), 500),
      referer: cleanString(request.headers.get("referer"), 1000),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }, { status: 202 });
  }
}
