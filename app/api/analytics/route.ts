import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/db";
import {
  checkRateLimit,
  classifyUserAgent,
  getAnalyticsEventRateLimitPerMinute,
  getClientIdentifier,
  getRequestGeo,
  isAnalyticsEnabled,
} from "@/lib/analytics-server";

// event_type values accepted from the client. Legacy names (nav_click,
// header_action_click, dashboard_open) are kept for backward compatibility
// with existing stored data and the pre-existing TrackedLink component; the
// newer names cover the rest of the site-wide analytics spec. See
// docs/ANALYTICS.md for the full event dictionary and how legacy names map
// onto it.
const allowedEventTypes = new Set([
  "nav_click",
  "header_action_click",
  "dashboard_open",
  "page_view",
  "session_started",
  "navigation_click",
  "dashboard_gate_opened",
  "dashboard_gate_cancelled",
  "dashboard_access_submitted",
  "dashboard_opened",
  "publication_downloaded",
  "data_request_started",
  "data_request_submitted",
  "contact_form_submitted",
  "external_link_clicked",
  "language_changed",
  "search_performed",
  "file_downloaded",
]);

const idPattern = /^[A-Za-z0-9_-]{1,128}$/;

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function cleanId(value: unknown) {
  const cleaned = cleanString(value, 128);
  return cleaned && idPattern.test(cleaned) ? cleaned : undefined;
}

function cleanLocale(value: unknown) {
  return value === "en" || value === "so" ? value : undefined;
}

function cleanMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  // Cap metadata size defensively — this is contextual reporting data, not
  // a free-form payload, and must never carry sensitive personal details.
  const entries = Object.entries(value as Record<string, unknown>).slice(0, 20);
  return Object.fromEntries(entries);
}

export async function POST(request: Request) {
  if (!isAnalyticsEnabled()) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const clientIdentifier = getClientIdentifier(request);
  const withinLimit = checkRateLimit(
    `analytics-event:${clientIdentifier}`,
    getAnalyticsEventRateLimitPerMinute(),
    60 * 1000,
  );

  if (!withinLimit) {
    // Swallow quietly (202) so a rate-limited beacon never surfaces as a
    // visible error to the visitor — analytics is best-effort.
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const eventType = cleanString(body.eventType, 80);

    if (!eventType || !allowedEventTypes.has(eventType)) {
      return NextResponse.json({ message: "Unsupported analytics event" }, { status: 400 });
    }

    const geo = getRequestGeo(request);
    const userAgentHeader = request.headers.get("user-agent");
    const { deviceCategory, browserCategory } = classifyUserAgent(userAgentHeader);

    await recordAnalyticsEvent({
      eventType,
      eventCategory: cleanString(body.eventCategory, 60),
      label: cleanString(body.label, 200),
      path: cleanString(body.path, 500),
      targetUrl: cleanString(body.targetUrl, 1000),
      metadata: cleanMetadata(body.metadata),
      userAgent: cleanString(userAgentHeader, 500),
      referer: cleanString(request.headers.get("referer"), 1000),
      anonymousVisitorId: cleanId(body.visitorId),
      sessionId: cleanId(body.sessionId),
      dashboardId: cleanId(body.dashboardId),
      dashboardTitle: cleanString(body.dashboardTitle, 200),
      locale: cleanLocale(body.locale),
      countryCode: geo.countryCode,
      region: geo.region,
      city: geo.city,
      deviceCategory,
      browserCategory,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }, { status: 202 });
  }
}
