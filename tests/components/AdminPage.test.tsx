import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
      if (String(url) !== "/api/admin/auth") expect(JSON.stringify(options)).not.toContain("test-password");
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
