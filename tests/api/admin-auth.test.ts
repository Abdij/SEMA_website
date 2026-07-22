import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  getPool: vi.fn(() => ({ query: vi.fn().mockResolvedValue({ rows: [] }) })),
}));

import { GET as getDashboardAccess } from "@/app/api/admin/dashboard-access/route";
import { GET as getAnalytics } from "@/app/api/admin/analytics/route";

const originalAdminPassword = process.env.ADMIN_PASSWORD;

beforeEach(() => {
  process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";
});

afterEach(() => {
  process.env.ADMIN_PASSWORD = originalAdminPassword;
});

describe("admin analytics endpoints reject unauthenticated requests", () => {
  it("GET /api/admin/dashboard-access without a Bearer token returns 401", async () => {
    const response = await getDashboardAccess(new Request("http://localhost/api/admin/dashboard-access"));
    expect(response.status).toBe(401);
  });

  it("GET /api/admin/dashboard-access with the wrong password returns 401", async () => {
    const response = await getDashboardAccess(
      new Request("http://localhost/api/admin/dashboard-access", {
        headers: { Authorization: "Bearer wrong-password" },
      }),
    );
    expect(response.status).toBe(401);
  });

  it("GET /api/admin/analytics without a Bearer token returns 401", async () => {
    const response = await getAnalytics(new Request("http://localhost/api/admin/analytics"));
    expect(response.status).toBe(401);
  });

  it("GET /api/admin/analytics with the correct password is authorized", async () => {
    const response = await getAnalytics(
      new Request("http://localhost/api/admin/analytics", {
        headers: { Authorization: "Bearer correct-horse-battery-staple" },
      }),
    );
    expect(response.status).not.toBe(401);
  });
});
