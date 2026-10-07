import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  insertDataRequest: vi.fn(),
  requireString: (value: unknown) => {
    if (typeof value !== "string" || !value.trim()) throw new Error("Required field");
    return value.trim();
  },
}));
vi.mock("nodemailer", () => ({ default: { createTransport: vi.fn() } }));
vi.mock("@/lib/security", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/security")>(), enforceRateLimit: vi.fn(),
}));

import nodemailer from "nodemailer";
import { insertDataRequest } from "@/lib/db";
import { POST } from "@/app/api/data-requests/route";
import { enforceRateLimit, SecurityError } from "@/lib/security";

const sendMail = vi.fn();
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
const body = { terms: true, name: "Test Requester", email: "requester@example.org", requesterType: "Researcher", dataRequested: "Summary data", intendedUse: "Research", preferredFormat: "CSV" };
const submit = (overrides = {}) => POST(new Request("http://localhost/api/data-requests", {
  method: "POST", body: JSON.stringify({ ...body, ...overrides }),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("SMTP_HOST", "smtp.example.org");
  vi.stubEnv("SMTP_USER", "sender");
  vi.stubEnv("SMTP_PASSWORD", "test-password");
  vi.stubEnv("SMTP_FROM", "SEMA <sender@example.org>");
  vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail } as never);
  sendMail.mockResolvedValue({ accepted: ["recipient"] });
  vi.mocked(insertDataRequest).mockResolvedValue({ id: "1", request_ref: "SEMA-123" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("information request notifications", () => {
  it("saves first and sends separate confirmation and staff emails with the reference", async () => {
    sendMail.mockImplementation(async () => {
      expect(insertDataRequest).toHaveBeenCalledTimes(1);
      return { accepted: ["recipient"] };
    });
    const response = await submit();
    expect(response.status).toBe(200);
    expect((await response.json()).emailNotifications).toEqual({ requester: true, staff: true });
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(sendMail).toHaveBeenNthCalledWith(1, expect.objectContaining({ to: body.email, replyTo: "mainoffice@sema.org.so", text: expect.stringContaining("SEMA-123") }));
    expect(sendMail).toHaveBeenNthCalledWith(2, expect.objectContaining({ to: "mainoffice@sema.org.so", replyTo: body.email, text: expect.stringContaining(body.dataRequested) }));
  });

  it("rejects invalid email and missing consent without saving or emailing", async () => {
    expect((await submit({ email: "invalid" })).status).toBe(400);
    expect((await submit({ terms: false })).status).toBe(400);
    expect(insertDataRequest).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("does not email when saving fails", async () => {
    vi.mocked(insertDataRequest).mockRejectedValue(new Error("Database unavailable"));
    expect((await submit()).status).toBe(503);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("still notifies staff when the requester email fails and preserves submission success", async () => {
    sendMail.mockRejectedValueOnce(new Error("SMTP rejection"));
    const response = await submit();
    expect(response.status).toBe(200);
    expect((await response.json()).emailNotifications).toEqual({ requester: false, staff: true });
    expect(sendMail).toHaveBeenCalledTimes(2);
  });

  it("reports missing SMTP configuration without losing the request", async () => {
    vi.stubEnv("SMTP_HOST", "");
    const response = await submit();
    expect(response.status).toBe(200);
    expect((await response.json()).emailNotifications).toEqual({ requester: false, staff: false });
    expect(insertDataRequest).toHaveBeenCalledTimes(1);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("reports rejected staff delivery separately", async () => {
    sendMail.mockResolvedValueOnce({ accepted: [body.email] }).mockResolvedValueOnce({ accepted: [] });
    expect((await (await submit()).json()).emailNotifications).toEqual({ requester: true, staff: false });
  });

  it("does not save or send email when either IP or recipient limits are exceeded", async () => {
    vi.mocked(enforceRateLimit).mockRejectedValueOnce(new SecurityError("Too many requests", 429, 3600));
    expect((await submit()).status).toBe(429);
    vi.mocked(enforceRateLimit).mockResolvedValueOnce(undefined).mockRejectedValueOnce(new SecurityError("Too many requests", 429, 3600));
    const response = await submit();
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("3600");
    expect(insertDataRequest).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });
});
