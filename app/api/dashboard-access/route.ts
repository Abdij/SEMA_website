import { NextResponse } from "next/server";
import { z } from "zod";
import { createDashboardAccess, getPublishedDashboardById, recordAnalyticsEvent } from "@/lib/db";
import {
  checkRateLimit,
  classifyUserAgent,
  getClientIdentifier,
  getConsentVersion,
  getDashboardAccessRateLimitPerHour,
  getRequestGeo,
  sanitizeText,
} from "@/lib/analytics-server";
import {
  ACTIVITY_TYPES,
  MAX_COUNTRY_LENGTH,
  MAX_ORGANIZATION_NAME_LENGTH,
  MAX_OTHER_TEXT_LENGTH,
  ORGANIZATION_TYPES,
} from "@/lib/dashboard-access-options";

// Opaque, client-generated visitor/session identifiers. They are random
// tokens (see lib/analytics-client.ts), never derived from anything
// identifying — validated here only to keep them well-formed before they
// reach the database.
const clientIdPattern = /^[A-Za-z0-9_-]{1,128}$/;
const clientId = z.string().regex(clientIdPattern).optional();

const baseFields = {
  dashboardId: z.string().uuid(),
  sourcePage: z.string().max(500).optional(),
  locale: z.enum(["en", "so"]).optional(),
  anonymousVisitorId: clientId,
  sessionId: clientId,
};

const registerSchema = z.object({
  ...baseFields,
  mode: z.literal("register"),
  organizationName: z.string().trim().min(2).max(MAX_ORGANIZATION_NAME_LENGTH),
  organizationType: z.enum(ORGANIZATION_TYPES).optional(),
  organizationTypeOther: z.string().trim().max(MAX_OTHER_TEXT_LENGTH).optional(),
  activityTypes: z.array(z.enum(ACTIVITY_TYPES)).min(1, "Select at least one area of activity."),
  activityTypeOther: z.string().trim().max(MAX_OTHER_TEXT_LENGTH).optional(),
  countryOfOperation: z.string().trim().max(MAX_COUNTRY_LENGTH).optional(),
  consent: z.literal(true, {
    message: "Consent is required before accessing the dashboard.",
  }),
});

const reuseSchema = z.object({
  ...baseFields,
  mode: z.literal("reuse"),
  previousAccessId: z.string().uuid().optional(),
});

const requestSchema = z.discriminatedUnion("mode", [registerSchema, reuseSchema]);

function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

function serverError() {
  return NextResponse.json(
    { message: "Unable to process the dashboard access request. Please try again." },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid submission.");
  }

  const input = parsed.data;

  const clientIdentifier = getClientIdentifier(request);
  const withinLimit = checkRateLimit(
    `dashboard-access:${clientIdentifier}`,
    getDashboardAccessRateLimitPerHour(),
    60 * 60 * 1000,
  );
  if (!withinLimit) {
    return NextResponse.json(
      { message: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  let dashboard;
  try {
    dashboard = await getPublishedDashboardById(input.dashboardId);
  } catch (error) {
    console.error("[dashboard-access] failed to look up dashboard", error);
    return serverError();
  }

  if (!dashboard) {
    return NextResponse.json({ message: "Requested dashboard was not found." }, { status: 404 });
  }

  // The dashboard URL always comes from the trusted server-side record —
  // the client never supplies (and cannot override) the destination URL.
  const dashboardUrl = dashboard.embed_url as string;
  const dashboardTitle = dashboard.title as string;

  const geo = getRequestGeo(request);
  const { deviceCategory, browserCategory } = classifyUserAgent(request.headers.get("user-agent"));
  const referrer = sanitizeText(request.headers.get("referer"), 1000);
  const userAgent = sanitizeText(request.headers.get("user-agent"), 500);

  try {
    if (input.mode === "register") {
      const access = await createDashboardAccess({
        organizationName: input.organizationName,
        organizationType: input.organizationType,
        organizationTypeOther: sanitizeText(input.organizationTypeOther, MAX_OTHER_TEXT_LENGTH),
        activityTypes: input.activityTypes,
        activityTypeOther: sanitizeText(input.activityTypeOther, MAX_OTHER_TEXT_LENGTH),
        countryOfOperation: sanitizeText(input.countryOfOperation, MAX_COUNTRY_LENGTH),
        dashboardId: dashboard.id,
        dashboardTitle,
        dashboardUrl,
        anonymousVisitorId: input.anonymousVisitorId,
        sessionId: input.sessionId,
        visitorCountry: geo.countryCode,
        visitorRegion: geo.region,
        visitorCity: geo.city,
        locale: input.locale,
        sourcePage: sanitizeText(input.sourcePage, 500),
        referrer,
        userAgent,
        consentGiven: true,
        consentVersion: getConsentVersion(),
      });

      await recordAnalyticsEvent({
        eventType: "dashboard_access_submitted",
        eventCategory: "dashboard",
        label: dashboardTitle,
        path: input.sourcePage,
        dashboardAccessId: access.id,
        dashboardId: dashboard.id,
        dashboardTitle,
        anonymousVisitorId: input.anonymousVisitorId,
        sessionId: input.sessionId,
        locale: input.locale,
        countryCode: geo.countryCode,
        region: geo.region,
        city: geo.city,
        deviceCategory,
        browserCategory,
        userAgent,
        referer: referrer,
        metadata: {
          organizationType: input.organizationType || null,
          activityTypeCount: input.activityTypes.length,
        },
      });

      await recordAnalyticsEvent({
        eventType: "dashboard_opened",
        eventCategory: "dashboard",
        label: dashboardTitle,
        targetUrl: dashboardUrl,
        path: input.sourcePage,
        dashboardAccessId: access.id,
        dashboardId: dashboard.id,
        dashboardTitle,
        anonymousVisitorId: input.anonymousVisitorId,
        sessionId: input.sessionId,
        locale: input.locale,
        countryCode: geo.countryCode,
        region: geo.region,
        city: geo.city,
        deviceCategory,
        browserCategory,
        userAgent,
        referer: referrer,
        metadata: { popupShown: true, reused: false },
      });

      return NextResponse.json({
        ok: true,
        accessId: access.id,
        dashboardUrl,
        dashboardTitle,
        consentVersion: access.consentVersion,
      });
    }

    // mode === "reuse": a previously-registered visitor is opening another
    // (or the same) dashboard. No new organization record is created; we
    // still record that the dashboard was opened.
    const previousAccessId =
      input.previousAccessId && /^[0-9a-f-]{36}$/i.test(input.previousAccessId)
        ? input.previousAccessId
        : undefined;

    await recordAnalyticsEvent({
      eventType: "dashboard_opened",
      eventCategory: "dashboard",
      label: dashboardTitle,
      targetUrl: dashboardUrl,
      path: input.sourcePage,
      dashboardAccessId: previousAccessId,
      dashboardId: dashboard.id,
      dashboardTitle,
      anonymousVisitorId: input.anonymousVisitorId,
      sessionId: input.sessionId,
      locale: input.locale,
      countryCode: geo.countryCode,
      region: geo.region,
      city: geo.city,
      deviceCategory,
      browserCategory,
      userAgent,
      referer: referrer,
      metadata: { popupShown: false, reused: true },
    });

    return NextResponse.json({ ok: true, dashboardUrl, dashboardTitle });
  } catch (error) {
    console.error("[dashboard-access] failed to save submission", error);
    return serverError();
  }
}
