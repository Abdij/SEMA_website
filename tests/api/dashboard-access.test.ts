import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  getPublishedDashboardById: vi.fn(),
  createDashboardAccess: vi.fn(),
  recordAnalyticsEvent: vi.fn(),
}));

import { POST } from "@/app/api/dashboard-access/route";
import { createDashboardAccess, getPublishedDashboardById, recordAnalyticsEvent } from "@/lib/db";
import type { DashboardAccessInput } from "@/lib/db";

const DASHBOARD_ID = "123e4567-e89b-42d3-a456-426614174000";
const TRUSTED_URL = "https://app.powerbi.com/view?r=trusted-report-id";

function makeRequest(body: unknown, ip = `10.0.0.${Math.floor(Math.random() * 1000)}`) {
  return new Request("http://localhost/api/dashboard-access", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

function validRegisterBody(overrides: Record<string, unknown> = {}) {
  return {
    mode: "register",
    dashboardId: DASHBOARD_ID,
    sourcePage: "/dashboards",
    locale: "en",
    visitorId: "visitor-abc",
    sessionId: "session-abc",
    organizationName: "Example Humanitarian Org",
    organizationType: "international_ngo",
    activityTypes: ["humanitarian", "mine_action"],
    countryOfOperation: "Somalia",
    consent: true,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPublishedDashboardById).mockResolvedValue({
    id: DASHBOARD_ID,
    title: "Mine Action Overview",
    provider: "powerbi",
    description: "desc",
    embed_url: TRUSTED_URL,
    public_safe: true,
    status: "published",
  } as never);
  vi.mocked(createDashboardAccess).mockImplementation(async (input: DashboardAccessInput) => ({
    ...input,
    id: "access-1",
    createdAt: new Date().toISOString(),
  }));
  vi.mocked(recordAnalyticsEvent).mockResolvedValue(undefined as never);
});

describe("POST /api/dashboard-access — valid submission", () => {
  it("succeeds and returns the trusted dashboard URL", async () => {
    const response = await POST(makeRequest(validRegisterBody()));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.dashboardUrl).toBe(TRUSTED_URL);
    expect(data.dashboardTitle).toBe("Mine Action Overview");
    expect(createDashboardAccess).toHaveBeenCalledTimes(1);
    // Both dashboard_access_submitted and dashboard_opened are recorded.
    expect(recordAnalyticsEvent).toHaveBeenCalledTimes(2);
    const eventTypes = vi.mocked(recordAnalyticsEvent).mock.calls.map((call) => call[0].eventType);
    expect(eventTypes).toEqual(["dashboard_access_submitted", "dashboard_opened"]);
  });
});

describe("POST /api/dashboard-access — validation", () => {
  it("rejects a missing organization name", async () => {
    const response = await POST(makeRequest(validRegisterBody({ organizationName: "" })));
    expect(response.status).toBe(400);
    expect(createDashboardAccess).not.toHaveBeenCalled();
  });

  it("rejects an empty activity type list", async () => {
    const response = await POST(makeRequest(validRegisterBody({ activityTypes: [] })));
    expect(response.status).toBe(400);
    expect(createDashboardAccess).not.toHaveBeenCalled();
  });

  it("rejects a submission with an unrecognized activity type", async () => {
    const response = await POST(makeRequest(validRegisterBody({ activityTypes: ["not_a_real_activity"] })));
    expect(response.status).toBe(400);
  });

  it("rejects missing consent", async () => {
    const response = await POST(makeRequest(validRegisterBody({ consent: false })));
    expect(response.status).toBe(400);
    expect(createDashboardAccess).not.toHaveBeenCalled();
  });

  it("rejects a malformed dashboardId", async () => {
    const response = await POST(makeRequest(validRegisterBody({ dashboardId: "not-a-uuid" })));
    expect(response.status).toBe(400);
    expect(getPublishedDashboardById).not.toHaveBeenCalled();
  });

  it("rejects an organization name that exceeds the max length", async () => {
    const response = await POST(makeRequest(validRegisterBody({ organizationName: "x".repeat(400) })));
    expect(response.status).toBe(400);
  });

  it("returns 404 when the dashboard does not exist or is not published", async () => {
    vi.mocked(getPublishedDashboardById).mockResolvedValueOnce(null);
    const response = await POST(makeRequest(validRegisterBody()));
    expect(response.status).toBe(404);
    expect(createDashboardAccess).not.toHaveBeenCalled();
  });
});

describe("POST /api/dashboard-access — cannot inject an arbitrary dashboard URL", () => {
  it("ignores any client-supplied dashboardUrl and always returns the server-trusted URL", async () => {
    const response = await POST(
      makeRequest(validRegisterBody({ dashboardUrl: "https://evil.example/phishing" })),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.dashboardUrl).toBe(TRUSTED_URL);
    expect(data.dashboardUrl).not.toContain("evil.example");
  });
});

describe("POST /api/dashboard-access — reuse mode", () => {
  it("records a dashboard_opened event without creating a new access record", async () => {
    const response = await POST(
      makeRequest({
        mode: "reuse",
        dashboardId: DASHBOARD_ID,
        sourcePage: "/dashboards",
        locale: "en",
        visitorId: "visitor-abc",
        sessionId: "session-def",
        previousAccessId: "223e4567-e89b-42d3-a456-426614174001",
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.dashboardUrl).toBe(TRUSTED_URL);
    expect(createDashboardAccess).not.toHaveBeenCalled();
    expect(recordAnalyticsEvent).toHaveBeenCalledTimes(1);
    expect(vi.mocked(recordAnalyticsEvent).mock.calls[0][0].eventType).toBe("dashboard_opened");
  });
});

describe("POST /api/dashboard-access — rate limiting", () => {
  it("returns 429 after exceeding the configured hourly limit", async () => {
    const previous = process.env.DASHBOARD_ACCESS_RATE_LIMIT_PER_HOUR;
    process.env.DASHBOARD_ACCESS_RATE_LIMIT_PER_HOUR = "2";
    const ip = `192.0.2.${Math.floor(Math.random() * 250)}`;

    try {
      const first = await POST(makeRequest(validRegisterBody(), ip));
      const second = await POST(makeRequest(validRegisterBody(), ip));
      const third = await POST(makeRequest(validRegisterBody(), ip));

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(third.status).toBe(429);
    } finally {
      process.env.DASHBOARD_ACCESS_RATE_LIMIT_PER_HOUR = previous;
    }
  });
});
