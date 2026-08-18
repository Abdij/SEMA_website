// Server-side helpers shared by the analytics + dashboard-access API routes.
//
// Everything here is privacy-conscious by construction: we only ever derive
// coarse, non-identifying signals (approximate geography, device/browser
// category) from headers that are already present on the request. We never
// read or store a raw IP address, and we never touch browser geolocation.

export type ApproxGeo = {
  countryCode?: string;
  region?: string;
  city?: string;
};

/**
 * Reads approximate location from trusted edge/CDN headers set by Vercel
 * (x-vercel-ip-*). Falls back to Cloudflare-style headers if present so the
 * app degrades gracefully off Vercel. Never falls back to reading or storing
 * the raw IP address itself.
 */
export function getRequestGeo(request: Request): ApproxGeo {
  const headers = request.headers;

  const countryCode =
    headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || undefined;
  const region = headers.get("x-vercel-ip-country-region") || undefined;
  const rawCity = headers.get("x-vercel-ip-city") || undefined;

  let city: string | undefined;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }

  return {
    countryCode: countryCode ? countryCode.toUpperCase().slice(0, 8) : undefined,
    region: region ? region.slice(0, 120) : undefined,
    city: city ? city.slice(0, 120) : undefined,
  };
}

export type DeviceCategory = "mobile" | "tablet" | "desktop" | "bot" | "unknown";
export type BrowserCategory =
  | "chrome"
  | "safari"
  | "firefox"
  | "edge"
  | "opera"
  | "samsung_internet"
  | "bot"
  | "other";

/**
 * Coarse, non-fingerprinting classification of a User-Agent string into a
 * device bucket and a browser family. This intentionally does not attempt to
 * extract OS/browser versions, model numbers, or any other high-entropy
 * signal — only the broad category needed for aggregate reporting.
 */
export function classifyUserAgent(userAgent: string | null | undefined): {
  deviceCategory: DeviceCategory;
  browserCategory: BrowserCategory;
} {
  const ua = (userAgent || "").toLowerCase();

  if (!ua) {
    return { deviceCategory: "unknown", browserCategory: "other" };
  }

  const isBot = /bot|crawler|spider|slurp|facebookexternalhit|pingdom|uptimerobot/.test(ua);
  if (isBot) {
    return { deviceCategory: "bot", browserCategory: "bot" };
  }

  let deviceCategory: DeviceCategory = "desktop";
  if (/ipad|tablet|kindle|playbook|silk/.test(ua) && !/mobile/.test(ua)) {
    deviceCategory = "tablet";
  } else if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(ua)) {
    deviceCategory = "mobile";
  }

  let browserCategory: BrowserCategory = "other";
  if (/edg\//.test(ua)) {
    browserCategory = "edge";
  } else if (/samsungbrowser/.test(ua)) {
    browserCategory = "samsung_internet";
  } else if (/opr\/|opera/.test(ua)) {
    browserCategory = "opera";
  } else if (/firefox\//.test(ua)) {
    browserCategory = "firefox";
  } else if (/chrome\/|crios\//.test(ua)) {
    browserCategory = "chrome";
  } else if (/safari\//.test(ua)) {
    browserCategory = "safari";
  }

  return { deviceCategory, browserCategory };
}

// --- Rate limiting -----------------------------------------------------
//
// Best-effort, in-memory, per-instance sliding window. Vercel serverless
// functions are not guaranteed to share memory across invocations or
// regions, so this is a "reasonable duplicate/abuse deterrent" rather than a
// hard distributed guarantee — documented in docs/ANALYTICS.md.

type Bucket = { count: number; windowStart: number };
const rateLimitBuckets = new Map<string, Bucket>();

const MAX_BUCKETS = 20000;

function pruneBucketsIfNeeded() {
  if (rateLimitBuckets.size <= MAX_BUCKETS) {
    return;
  }
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets) {
    if (now - bucket.windowStart > 60 * 60 * 1000) {
      rateLimitBuckets.delete(key);
    }
  }
}

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    rateLimitBuckets.set(key, { count: 1, windowStart: now });
    pruneBucketsIfNeeded();
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

/** Best-effort client identifier for rate limiting only (never persisted). */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
  return ip;
}

// --- Environment-driven configuration -----------------------------------

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function isAnalyticsEnabled(): boolean {
  return process.env.ANALYTICS_ENABLED !== "false";
}

export function getDashboardAccessRememberDays(): number {
  return envInt("NEXT_PUBLIC_DASHBOARD_ACCESS_REMEMBER_DAYS", 30);
}

export function getSessionTimeoutMinutes(): number {
  return envInt("ANALYTICS_SESSION_TIMEOUT_MINUTES", 30);
}

export function getRawEventRetentionDays(): number {
  return envInt("ANALYTICS_RAW_EVENT_RETENTION_DAYS", 365);
}

export function getDashboardAccessRetentionDays(): number {
  return envInt("DASHBOARD_ACCESS_RETENTION_DAYS", 730);
}

export function getDashboardAccessRateLimitPerHour(): number {
  return envInt("DASHBOARD_ACCESS_RATE_LIMIT_PER_HOUR", 20);
}

export function getAnalyticsEventRateLimitPerMinute(): number {
  return envInt("ANALYTICS_EVENT_RATE_LIMIT_PER_MINUTE", 60);
}

export function getAdminLoginRateLimitPer5Minutes(): number {
  return envInt("ADMIN_LOGIN_RATE_LIMIT_PER_5MIN", 8);
}

export function getConsentVersion(): string {
  return process.env.DASHBOARD_ACCESS_CONSENT_VERSION || "1.0";
}

const CONTROL_CHAR_CODES = (() => {
  const codes: number[] = [];
  for (let code = 0; code <= 31; code += 1) {
    if (code !== 9 && code !== 10 && code !== 13) {
      codes.push(code);
    }
  }
  codes.push(127);
  return codes;
})();

function stripControlChars(value: string): string {
  let result = "";
  for (const char of value) {
    if (!CONTROL_CHAR_CODES.includes(char.charCodeAt(0))) {
      result += char;
    }
  }
  return result;
}

/** Truncates free text to a safe max length and strips control characters. */
export function sanitizeText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const cleaned = stripControlChars(value).trim();
  if (!cleaned) {
    return undefined;
  }
  return cleaned.slice(0, maxLength);
}
