import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  recordAnalyticsEvent: vi.fn(),
}));

import { POST } from "@/app/api/analytics/route";
import { recordAnalyticsEvent } from "@/lib/db";

function makeRequest(body: unknown, ip = `198.51.100.${Math.floor(Math.random() * 250)}`) {
  return new Request("http://localhost/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(recordAnalyticsEvent).mockResolvedValue(undefined as never);
});

describe("POST /api/analytics", () => {
  it("accepts a known event type and records it", async () => {
    const response = await POST(makeRequest({ eventType: "page_view", path: "/dashboards" }));
    expect(response.status).toBe(200);
    expect(recordAnalyticsEvent).toHaveBeenCalledTimes(1);
    expect(vi.mocked(recordAnalyticsEvent).mock.calls[0][0]).toMatchObject({ eventType: "page_view", path: "/dashboards" });
  });

  it("accepts every event type defined in the spec's event dictionary", async () => {
    const eventTypes = [
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
    ];

    for (const eventType of eventTypes) {
      const response = await POST(makeRequest({ eventType }));
      expect(response.status).toBe(200);
    }

    expect(recordAnalyticsEvent).toHaveBeenCalledTimes(eventTypes.length);
  });

  it("rejects an unsupported event type", async () => {
    const response = await POST(makeRequest({ eventType: "totally_made_up_event" }));
    expect(response.status).toBe(400);
    expect(recordAnalyticsEvent).not.toHaveBeenCalled();
  });

  it("derives device and browser category from the User-Agent header, not the client", async () => {
    const request = new Request("http://localhost/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1",
        "x-forwarded-for": "198.51.100.77",
      },
      body: JSON.stringify({ eventType: "page_view", deviceCategory: "desktop" }),
    });

    await POST(request);
    expect(vi.mocked(recordAnalyticsEvent).mock.calls[0][0].deviceCategory).toBe("mobile");
  });

  it("caps rate-limited requests without surfacing an error to the client", async () => {
    const previous = process.env.ANALYTICS_EVENT_RATE_LIMIT_PER_MINUTE;
    process.env.ANALYTICS_EVENT_RATE_LIMIT_PER_MINUTE = "2";
    const ip = `198.51.100.${Math.floor(Math.random() * 250)}`;

    try {
      const first = await POST(makeRequest({ eventType: "page_view" }, ip));
      const second = await POST(makeRequest({ eventType: "page_view" }, ip));
      const third = await POST(makeRequest({ eventType: "page_view" }, ip));

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      // Rate-limited beacons return 202 (accepted, silently dropped) rather
      // than an error — analytics must never break the visitor experience.
      expect(third.status).toBe(202);
      expect(recordAnalyticsEvent).toHaveBeenCalledTimes(2);
    } finally {
      process.env.ANALYTICS_EVENT_RATE_LIMIT_PER_MINUTE = previous;
    }
  });
});
