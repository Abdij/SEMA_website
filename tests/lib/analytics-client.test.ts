import { beforeEach, describe, expect, it, vi } from "vitest";

// Fresh module instance per test so the internal lastPageViewKey module
// state doesn't leak between tests.
async function freshClient() {
  vi.resetModules();
  return import("@/lib/analytics-client");
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("getOrCreateVisitorId", () => {
  it("creates a visitor id and persists it across calls", async () => {
    const { getOrCreateVisitorId } = await freshClient();
    const first = getOrCreateVisitorId();
    const second = getOrCreateVisitorId();
    expect(first).toBeTruthy();
    expect(first).toBe(second);
  });
});

describe("getOrCreateSessionId", () => {
  it("returns the same session id on repeated calls within the timeout", async () => {
    const { getOrCreateSessionId } = await freshClient();
    const first = getOrCreateSessionId();
    const second = getOrCreateSessionId();
    expect(first.isNewSession).toBe(true);
    expect(second.isNewSession).toBe(false);
    expect(first.sessionId).toBe(second.sessionId);
  });

  it("starts a new session once the stored session has expired", async () => {
    const { getOrCreateSessionId } = await freshClient();
    const first = getOrCreateSessionId();

    // Simulate 31 minutes of inactivity by rewriting the stored timestamp
    // (matches the default 30-minute ANALYTICS_SESSION_TIMEOUT_MINUTES).
    const raw = window.sessionStorage.getItem("sema_session");
    const record = JSON.parse(raw as string);
    record.lastActivity = Date.now() - 31 * 60 * 1000;
    window.sessionStorage.setItem("sema_session", JSON.stringify(record));

    const second = getOrCreateSessionId();
    expect(second.isNewSession).toBe(true);
    expect(second.sessionId).not.toBe(first.sessionId);
  });
});

describe("trackEvent page_view dedupe", () => {
  it("sends only one page_view beacon for the same path", async () => {
    const { trackEvent } = await freshClient();
    const sendBeacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(window.navigator, "sendBeacon", {
      value: sendBeacon,
      configurable: true,
    });

    trackEvent({ eventType: "page_view" });
    trackEvent({ eventType: "page_view" });
    trackEvent({ eventType: "page_view" });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });

  it("does not dedupe non-page_view events", async () => {
    const { trackEvent } = await freshClient();
    const sendBeacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(window.navigator, "sendBeacon", {
      value: sendBeacon,
      configurable: true,
    });

    trackEvent({ eventType: "external_link_clicked", targetUrl: "https://a.example" });
    trackEvent({ eventType: "external_link_clicked", targetUrl: "https://b.example" });

    expect(sendBeacon).toHaveBeenCalledTimes(2);
  });
});

describe("dashboard access registration cache", () => {
  it("stores and retrieves a registration within the remember window", async () => {
    const { storeDashboardRegistration, getStoredDashboardRegistration } = await freshClient();

    storeDashboardRegistration({
      organizationName: "Test Org",
      activityTypes: ["mine_action"],
    });

    const stored = getStoredDashboardRegistration();
    expect(stored?.organizationName).toBe("Test Org");
    expect(stored?.activityTypes).toEqual(["mine_action"]);
  });

  it("returns null once the registration has expired", async () => {
    const { storeDashboardRegistration, getStoredDashboardRegistration } = await freshClient();

    storeDashboardRegistration({ organizationName: "Test Org", activityTypes: ["mine_action"] }, -1);

    expect(getStoredDashboardRegistration()).toBeNull();
  });

  it("clearDashboardRegistration removes the stored value", async () => {
    const { storeDashboardRegistration, getStoredDashboardRegistration, clearDashboardRegistration } =
      await freshClient();

    storeDashboardRegistration({ organizationName: "Test Org", activityTypes: ["mine_action"] });
    clearDashboardRegistration();

    expect(getStoredDashboardRegistration()).toBeNull();
  });
});
