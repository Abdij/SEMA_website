import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/db", () => ({ insertContactMessage: vi.fn(), requireString: (value: string) => value.trim() }));
vi.mock("@/lib/security", async (original) => ({ ...await original<typeof import("@/lib/security")>(), enforceRateLimit: vi.fn() }));
import { insertContactMessage } from "@/lib/db";
import { enforceRateLimit, SecurityError } from "@/lib/security";
import { POST } from "@/app/api/contact/route";
const valid = { name: "Test", email: "test@example.org", enquiryType: "General", subject: "Question", message: "Test message", consent: true };
const submit = (body: unknown) => POST(new Request("https://sema.org.so/api/contact", { method: "POST", body: JSON.stringify(body) }));
beforeEach(() => { vi.resetAllMocks(); vi.mocked(insertContactMessage).mockResolvedValue({ id: "test" }); });
describe("contact submissions", () => {
  it("rejects malformed emails before saving", async () => {
    expect((await submit({ ...valid, email: "not-an-address" })).status).toBe(400);
    expect(insertContactMessage).not.toHaveBeenCalled();
  });
  it("accepts a valid consented submission", async () => {
    expect((await submit(valid)).status).toBe(200);
    expect(insertContactMessage).toHaveBeenCalledOnce();
  });
  it("rejects abuse before writing", async () => {
    vi.mocked(enforceRateLimit).mockRejectedValue(new SecurityError("Too many requests", 429, 300));
    expect((await submit(valid)).status).toBe(429);
    expect(insertContactMessage).not.toHaveBeenCalled();
  });
});
