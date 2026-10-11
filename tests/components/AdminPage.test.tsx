import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminPage from "@/app/admin/page";

const article = {
  slug: "existing-article", title: "Existing article", date: "2026-10-06",
  category: "News", summary: "Summary", image: "", body: ["Body"], status: "published",
};

beforeEach(() => { window.localStorage.clear(); });
afterEach(() => { vi.restoreAllMocks(); });

async function signIn() {
  render(<AdminPage />);
  fireEvent.change(screen.getByLabelText("Admin password"), { target: { value: "test-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
}

function mockResponses(failure: () => "server" | "network" | "unauthorized" | null) {
  return vi.spyOn(global, "fetch").mockImplementation(async (url, options) => {
    const path = String(url);
    if (path === "/api/admin/auth") return options?.method === "POST"
      ? Response.json({ ok: true }) : Response.json({}, { status: 401 });
    if (path === "/api/admin/news") {
      const mode = failure();
      if (mode === "network") throw new Error("Connection lost");
      if (mode) return Response.json({ message: "Failed" }, { status: mode === "unauthorized" ? 401 : 500 });
      return Response.json([article]);
    }
    if (path.startsWith("/api/admin/analytics") || path.startsWith("/api/admin/dashboard-access")) {
      return Response.json({}, { status: 503 });
    }
    return Response.json([]);
  });
}

describe("admin data loading", () => {
  it("clears legacy saved passwords and uses cookies for subsequent calls", async () => {
    window.localStorage.setItem("sema_admin_password", "legacy-password");
    const fetchMock = mockResponses(() => null);
    await signIn();
    await screen.findByText("Data loaded.");
    expect(window.localStorage.getItem("sema_admin_password")).toBeNull();
    for (const [url, options] of fetchMock.mock.calls) {
      expect(new Headers(options?.headers).get("authorization")).toBeNull();
      if (String(url) !== "/api/admin/auth") expect(JSON.stringify(options ?? {})).not.toContain("test-password");
    }
  });
  it.each(["server", "network"] as const)("preserves login and existing data after a %s failure, then recovers on refresh", async (failure) => {
    let mode: "server" | "network" | null = null;
    mockResponses(() => mode);
    await signIn();
    expect(await screen.findByText("Data loaded.")).toBeInTheDocument();
    expect(screen.getByText("Existing article")).toBeInTheDocument();
    mode = failure;
    fireEvent.click(screen.getByRole("button", { name: "Refresh data" }));
    expect(await screen.findByText(/Unable to refresh news/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.getByText("Existing article")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign in" })).not.toBeInTheDocument();
    mode = null;
    fireEvent.click(screen.getByRole("button", { name: "Refresh data" }));
    expect(await screen.findByText("Data loaded.")).toBeInTheDocument();
  });

  it("still requires login again when the server rejects authentication", async () => {
    mockResponses(() => "unauthorized");
    await signIn();
    expect(await screen.findByText("Authorization failed. Please log in again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("loads available sections when one endpoint fails during initial login", async () => {
    mockResponses(() => "server");
    await signIn();
    await waitFor(() => expect(screen.getByText(/Unable to refresh news/)).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "News posts" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });
});


it("never shows a late transcript response under a different session", async () => {
  let resolveFirst!: (response: Response) => void;
  const deferred = new Promise<Response>(resolve => { resolveFirst = resolve; });
  vi.spyOn(global, "fetch").mockImplementation(async (url, options) => {
    const path = String(url);
    if (path === "/api/admin/auth") return Response.json({}, { status: options?.method === "POST" ? 200 : 401 });
    if (path.includes("sessionId=first")) return deferred;
    if (path.includes("sessionId=second")) return Response.json([{ id: "m2", role: "user", content: "Second transcript" }]);
    if (path.startsWith("/api/admin/chat-logs")) return Response.json(["first", "second"].map(id => ({ id, first_message: id, message_count: 1, last_active_at: "2026-10-11" })));
    if (path.includes("analytics") || path.includes("dashboard-access")) return Response.json({}, { status: 503 });
    return Response.json([]);
  });
  await signIn(); await screen.findByText("Data loaded.");
  fireEvent.click(screen.getByRole("button", { name: "chat logs" }));
  const buttons = await screen.findAllByRole("button", { name: "View transcript" });
  fireEvent.click(buttons[0]); fireEvent.click(buttons[1]);
  expect(await screen.findByText("Second transcript", { exact: false })).toBeInTheDocument();
  await act(async () => resolveFirst(Response.json([{ id: "m1", role: "user", content: "First transcript" }])));
  expect(screen.queryByText("First transcript", { exact: false })).not.toBeInTheDocument();
  expect(screen.getByText("Second transcript", { exact: false })).toBeInTheDocument();
});
