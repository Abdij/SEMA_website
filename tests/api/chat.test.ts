// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/db", () => ({ getPool: vi.fn(), createChatSession: vi.fn(), insertChatMessage: vi.fn() }));
vi.mock("@/lib/security", async original => ({ ...await original<typeof import("@/lib/security")>(), enforceRateLimit: vi.fn() }));
import { createChatSession, insertChatMessage } from "@/lib/db";
import { enforceRateLimit, SecurityError } from "@/lib/security";
import { POST } from "@/app/api/chat/route";
const submit = (body: unknown, origin = "https://sema.org.so") => POST(new Request("https://sema.org.so/api/chat", { method: "POST", headers: { origin }, body: JSON.stringify(body) }));
beforeEach(() => vi.resetAllMocks());
describe("stateless FAQ endpoint", () => {
  it("returns fixed answers and links without saving transcripts", async () => {
    const response = await submit({ message: "Hi, how do I request data?" });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toMatchObject({ id: "data-request", actions: [{ href: "/en/data-request" }] });
    expect(createChatSession).not.toHaveBeenCalled();
    expect(insertChatMessage).not.toHaveBeenCalled();
  });
  it.each([{ message: "" }, { message: "x".repeat(1001) }, { message: "hello", sessionId: "a-stolen-session-id" }])("rejects invalid input", async body => expect((await submit(body)).status).toBe(400));
  it("rejects cross-site requests", async () => expect((await submit({ message: "hello" }, "https://other.example")).status).toBe(403));
  it("bounds the request body", async () => expect((await submit({ message: "x".repeat(9000) })).status).toBe(413));
  it("preserves shared rate limiting and retry timing", async () => {
    vi.mocked(enforceRateLimit).mockRejectedValue(new SecurityError("Too many requests", 429, 300));
    const response = await submit({ message: "hello" });
    expect(response.status).toBe(429); expect(response.headers.get("retry-after")).toBe("300");
  });
});
