import { describe, expect, it } from "vitest";
import {
  checkRateLimit,
  classifyUserAgent,
  getRequestGeo,
  sanitizeText,
} from "@/lib/analytics-server";

describe("classifyUserAgent", () => {
  it("classifies a common desktop Chrome UA", () => {
    const result = classifyUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    );
    expect(result.deviceCategory).toBe("desktop");
    expect(result.browserCategory).toBe("chrome");
  });

  it("classifies an iPhone Safari UA as mobile", () => {
    const result = classifyUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
    );
    expect(result.deviceCategory).toBe("mobile");
    expect(result.browserCategory).toBe("safari");
  });

  it("classifies an iPad UA as tablet", () => {
    const result = classifyUserAgent(
      "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Safari/604.1",
    );
    expect(result.deviceCategory).toBe("tablet");
  });

  it("classifies known bots", () => {
    const result = classifyUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)");
    expect(result.deviceCategory).toBe("bot");
    expect(result.browserCategory).toBe("bot");
  });

  it("handles missing/empty UA safely", () => {
    expect(classifyUserAgent(undefined)).toEqual({ deviceCategory: "unknown", browserCategory: "other" });
    expect(classifyUserAgent(null)).toEqual({ deviceCategory: "unknown", browserCategory: "other" });
    expect(classifyUserAgent("")).toEqual({ deviceCategory: "unknown", browserCategory: "other" });
  });
});

describe("getRequestGeo", () => {
  it("reads Vercel geo headers and decodes the city", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-vercel-ip-country": "so",
        "x-vercel-ip-country-region": "BN",
        "x-vercel-ip-city": "Mogadishu%20City",
      },
    });

    const geo = getRequestGeo(request);
    expect(geo.countryCode).toBe("SO");
    expect(geo.region).toBe("BN");
    expect(geo.city).toBe("Mogadishu City");
  });

  it("returns undefined fields when headers are absent", () => {
    const request = new Request("https://example.com");
    const geo = getRequestGeo(request);
    expect(geo.countryCode).toBeUndefined();
    expect(geo.region).toBeUndefined();
    expect(geo.city).toBeUndefined();
  });

  it("never reads or echoes a raw IP address", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.42" },
    });
    const geo = getRequestGeo(request);
    expect(JSON.stringify(geo)).not.toContain("203.0.113.42");
  });
});

describe("sanitizeText", () => {
  it("trims and truncates to the max length", () => {
    expect(sanitizeText("  hello world  ", 5)).toBe("hello");
  });

  it("strips control characters but keeps normal punctuation", () => {
    const withControlChars = "hello" + String.fromCharCode(7) + "world" + String.fromCharCode(27) + "!";
    expect(sanitizeText(withControlChars, 50)).toBe("helloworld!");
  });

  it("returns undefined for non-string input", () => {
    expect(sanitizeText(42, 10)).toBeUndefined();
    expect(sanitizeText(null, 10)).toBeUndefined();
    expect(sanitizeText(undefined, 10)).toBeUndefined();
  });

  it("returns undefined for whitespace-only input", () => {
    expect(sanitizeText("   ", 10)).toBeUndefined();
  });
});

describe("checkRateLimit", () => {
  it("allows requests under the limit and blocks once exceeded", () => {
    const key = `test-${Math.random()}`;
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(false);
  });

  it("tracks distinct keys independently", () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    expect(checkRateLimit(keyA, 1, 60_000)).toBe(true);
    expect(checkRateLimit(keyA, 1, 60_000)).toBe(false);
    expect(checkRateLimit(keyB, 1, 60_000)).toBe(true);
  });
});
