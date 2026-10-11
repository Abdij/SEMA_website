// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
vi.mock("@/lib/admin", async original => ({ ...await original<typeof import("@/lib/admin")>(), requireAdminAuth: vi.fn() }));
vi.mock("@/lib/db", () => ({ getPool: vi.fn(), getChatSessionMessages: vi.fn(), listChatSessionsForAdmin: vi.fn() }));
import { requireAdminAuth } from "@/lib/admin";
import { getChatSessionMessages, listChatSessionsForAdmin } from "@/lib/db";
import { SecurityError } from "@/lib/security";
import { GET } from "@/app/api/admin/chat-logs/route";
const get = (query = "") => GET(new Request(`https://sema.org.so/api/admin/chat-logs${query}`));
beforeEach(() => vi.resetAllMocks());
it("requires administrator authentication before looking up messages", async () => {
  vi.mocked(requireAdminAuth).mockRejectedValue(new SecurityError("Unauthorized", 401));
  expect((await get()).status).toBe(401); expect(listChatSessionsForAdmin).not.toHaveBeenCalled();
});
it.each(["?sessionId=invalid", "?offset=-1", "?limit=2.5", "?limit=Infinity", "?offset=1.5"])("validates %s", async query => {
  expect((await get(query)).status).toBe(400);
  expect(getChatSessionMessages).not.toHaveBeenCalled(); expect(listChatSessionsForAdmin).not.toHaveBeenCalled();
});
it("does not expose database errors", async () => {
  vi.mocked(listChatSessionsForAdmin).mockRejectedValue(new Error("private database details"));
  const response = await get(); expect(response.status).toBe(500); expect(await response.text()).not.toContain("private database details");
});
it("supports paging through older sessions without caching", async () => {
  vi.mocked(listChatSessionsForAdmin).mockResolvedValue([]);
  const response = await get("?limit=50&offset=50");
  expect(response.status).toBe(200); expect(listChatSessionsForAdmin).toHaveBeenCalledWith(50,50);
  expect(response.headers.get("cache-control")).toBe("no-store");
});
