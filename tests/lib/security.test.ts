import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/db", () => ({ getPool: vi.fn() }));
import { getPool } from "@/lib/db";
import { enforceRateLimit, readLimitedJson, requireSameOrigin } from "@/lib/security";
import { attachmentDisposition } from "@/lib/download";
import { contentSecurityPolicy } from "@/lib/security-headers";

describe("request security boundaries", () => {
  it("bounds actual bytes even without Content-Length", async () => {
    const request = new Request("https://sema.org.so/api/contact", { method: "POST", body: JSON.stringify({ message: "x".repeat(100) }) });
    await expect(readLimitedJson(request, 32)).rejects.toMatchObject({ status: 413 });
  });
  it.each(["null", "[]", "broken JSON"])("rejects invalid JSON objects: %s", async (body) => {
    await expect(readLimitedJson(new Request("https://sema.org.so/api/contact", { method: "POST", body }))).rejects.toMatchObject({ status: 400 });
  });
  it("rejects cross-origin writes, including a sibling origin", () => {
    expect(() => requireSameOrigin(new Request("https://sema.org.so/api/admin/auth", { headers: { origin: "https://other.sema.org.so" } }))).toThrow();
    expect(() => requireSameOrigin(new Request("https://sema.org.so/api/admin/auth", { headers: { origin: "https://sema.org.so", "sec-fetch-site": "cross-site" } }))).toThrow();
    expect(() => requireSameOrigin(new Request("https://sema.org.so/api/admin/auth", { headers: { origin: "https://sema.org.so" } }))).not.toThrow();
  });
  it("fails closed with a generic error when shared throttling is unavailable", async () => {
    vi.mocked(getPool).mockImplementation(() => { throw new Error("private connection details"); });
    await expect(enforceRateLimit("test", "test", 1, 60)).rejects.toMatchObject({ status: 503, message: "This service is temporarily unavailable. Please try again later." });
  });
  it("makes hostile and Unicode download names valid headers", () => {
    const value = attachmentDisposition('a";\r\nX-Evil: yes/é.pdf');
    expect(value).not.toMatch(/[\r\n]/);
    expect(value).toMatch(/^attachment; filename="[^"\\]*"; filename\*=UTF-8''/);
    expect(value).toContain("%C3%A9.pdf");
    expect(() => new Headers({ "Content-Disposition": value })).not.toThrow();
  });
  it("allows production scripts only through nonces and trusted descendants", () => {
    const policy = contentSecurityPolicy("unique-test-nonce", false);
    const scripts = policy.split(";").find((part) => part.includes("script-src"));
    expect(scripts).toContain("'nonce-unique-test-nonce' 'strict-dynamic'");
    expect(scripts).not.toContain("unsafe-inline");
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).toContain("frame-ancestors 'none'");
  });
});
