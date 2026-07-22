"use client";

// Client-side analytics helpers: anonymous visitor/session identity, event
// dispatch, and the local cache that lets a returning visitor skip the
// dashboard-access form for a configurable number of days.
//
// Privacy notes:
// - The visitor ID is a random token stored first-party (localStorage). It
//   is not derived from any device/browser fingerprint and carries no
//   personal information.
// - Nothing here reads browser geolocation or any invasive device signal.

const VISITOR_ID_KEY = "sema_visitor_id";
const SESSION_KEY = "sema_session";
const DASHBOARD_REGISTRATION_KEY = "sema_dashboard_access_v1";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function readEnvInt(value: string | undefined, fallback: number): number {
  const parsed = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const SESSION_TIMEOUT_MS =
  readEnvInt(process.env.NEXT_PUBLIC_ANALYTICS_SESSION_TIMEOUT_MINUTES, 30) * 60 * 1000;

export const DASHBOARD_ACCESS_REMEMBER_DAYS = readEnvInt(
  process.env.NEXT_PUBLIC_DASHBOARD_ACCESS_REMEMBER_DAYS,
  30,
);

function safeLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeSessionStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getOrCreateVisitorId(): string | undefined {
  const storage = safeLocalStorage();
  if (!storage) return undefined;

  try {
    const existing = storage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;

    const created = randomId();
    storage.setItem(VISITOR_ID_KEY, created);
    return created;
  } catch {
    return undefined;
  }
}

type SessionRecord = { id: string; lastActivity: number };

/**
 * Returns the current session ID, rotating to a new one after
 * SESSION_TIMEOUT_MS of inactivity. Returns whether a *new* session was
 * started so the caller can fire a session_started event exactly once.
 */
export function getOrCreateSessionId(): { sessionId: string | undefined; isNewSession: boolean } {
  const storage = safeSessionStorage();
  if (!storage) return { sessionId: undefined, isNewSession: false };

  try {
    const now = Date.now();
    const raw = storage.getItem(SESSION_KEY);
    const existing: SessionRecord | null = raw ? JSON.parse(raw) : null;

    if (existing && now - existing.lastActivity < SESSION_TIMEOUT_MS) {
      const updated: SessionRecord = { id: existing.id, lastActivity: now };
      storage.setItem(SESSION_KEY, JSON.stringify(updated));
      return { sessionId: existing.id, isNewSession: false };
    }

    const created: SessionRecord = { id: randomId(), lastActivity: now };
    storage.setItem(SESSION_KEY, JSON.stringify(created));
    return { sessionId: created.id, isNewSession: true };
  } catch {
    return { sessionId: undefined, isNewSession: false };
  }
}

export type TrackEventInput = {
  eventType: string;
  eventCategory?: string;
  label?: string;
  targetUrl?: string;
  dashboardId?: string;
  dashboardTitle?: string;
  locale?: string;
  metadata?: Record<string, unknown>;
};

let lastPageViewKey: string | null = null;

export function trackEvent(input: TrackEventInput) {
  if (typeof window === "undefined") return;

  // Avoid duplicate page_view events caused by React re-renders/effects
  // firing more than once for the same path.
  if (input.eventType === "page_view") {
    const key = `${window.location.pathname}${window.location.search}`;
    if (lastPageViewKey === key) return;
    lastPageViewKey = key;
  }

  const visitorId = getOrCreateVisitorId();
  const { sessionId } = getOrCreateSessionId();

  const payload = JSON.stringify({
    eventType: input.eventType,
    eventCategory: input.eventCategory,
    label: input.label,
    targetUrl: input.targetUrl,
    dashboardId: input.dashboardId,
    dashboardTitle: input.dashboardTitle,
    locale: input.locale,
    path: `${window.location.pathname}${window.location.search}`,
    visitorId,
    sessionId,
    metadata: input.metadata ?? {},
  });

  try {
    if ("sendBeacon" in navigator) {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/analytics", blob);
      if (sent) return;
    }
  } catch {
    // fall through to fetch
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

// --- Dashboard-access registration cache (30-day remember) --------------

export type StoredDashboardRegistration = {
  organizationName: string;
  organizationType?: string;
  organizationTypeOther?: string;
  activityTypes: string[];
  activityTypeOther?: string;
  countryOfOperation?: string;
  lastAccessId?: string;
  savedAt: number;
  expiresAt: number;
};

export function getStoredDashboardRegistration(): StoredDashboardRegistration | null {
  const storage = safeLocalStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(DASHBOARD_REGISTRATION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredDashboardRegistration;
    if (!parsed.expiresAt || parsed.expiresAt < Date.now()) {
      storage.removeItem(DASHBOARD_REGISTRATION_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function storeDashboardRegistration(
  data: Omit<StoredDashboardRegistration, "savedAt" | "expiresAt">,
  rememberDays: number = DASHBOARD_ACCESS_REMEMBER_DAYS,
) {
  const storage = safeLocalStorage();
  if (!storage) return;

  const now = Date.now();
  const record: StoredDashboardRegistration = {
    ...data,
    savedAt: now,
    expiresAt: now + rememberDays * 24 * 60 * 60 * 1000,
  };

  try {
    storage.setItem(DASHBOARD_REGISTRATION_KEY, JSON.stringify(record));
  } catch {
    // storage full or unavailable — the visitor will simply see the form again
  }
}

export function clearDashboardRegistration() {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(DASHBOARD_REGISTRATION_KEY);
  } catch {
    // ignore
  }
}
