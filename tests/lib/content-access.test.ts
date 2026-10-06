import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("pg", () => ({ Pool: class { query = query; } }));

import {
  getNewsPosts, getNewsPostBySlug, getAdminNewsPostBySlug,
  getDashboardEmbeds, getPublishedDashboardById,
  hasValidDashboardRegistration, updatePublication,
} from "@/lib/db";
import { newsPosts } from "@/lib/content";

beforeEach(() => {
  vi.stubEnv("DATABASE_URL", "postgresql://test.invalid/test");
  global.semaPool = undefined;
  query.mockReset();
  query.mockResolvedValue({ rows: [] });
});
afterEach(() => {
  vi.unstubAllEnvs();
  global.semaPool = undefined;
});

describe("public content queries", () => {
  it("requires published articles publicly while allowing authenticated admin draft lookup", async () => {
    // An unpublished/removed database article must not reappear from static fallback content.
    expect(await getNewsPostBySlug(newsPosts[0].slug)).toBeUndefined();
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining("($2::boolean = false or status = 'published')"),
      [newsPosts[0].slug, true],
    );
    query.mockResolvedValueOnce({ rows: [{ slug: "draft", title: "Draft", status: "draft" }] });
    expect(await getAdminNewsPostBySlug("draft")).toMatchObject({ status: "draft" });
    expect(query.mock.lastCall?.[1]).toEqual(["draft", false]);
  });

  it("returns articles beyond the sixth for the archive and limits only the homepage", async () => {
    const rows = Array.from({ length: 9 }, (_, index) => ({ slug: `article-${index}`, title: `Article ${index}` }));
    query.mockResolvedValueOnce({ rows });
    expect(await getNewsPosts()).toHaveLength(9);
    expect(query.mock.lastCall?.[1]).toEqual([null]);
    await getNewsPosts(6);
    expect(query.mock.lastCall?.[1]).toEqual([6]);
  });

  it("does not restore static news when all database articles are unpublished", async () => {
    expect(await getNewsPosts()).toEqual([]);
  });

  it("requires public-safe published dashboards in both listing and direct lookup", async () => {
    expect(await getDashboardEmbeds()).toEqual([]);
    expect(query.mock.lastCall?.[0]).toContain("status = 'published' and public_safe = true");
    expect(await getPublishedDashboardById("dashboard-id")).toBeNull();
    expect(query.mock.lastCall?.[0]).toContain("status = 'published' and public_safe = true");
  });

  it("does not expose ungated dashboard URLs when the database is unconfigured", async () => {
    vi.stubEnv("DATABASE_URL", "");
    expect((await getDashboardEmbeds()).every((item) => !("url" in item) || !item.url)).toBe(true);
    expect(query).not.toHaveBeenCalled();
  });

  it("checks stored visitor identity, consent version, consent, and expiry before reuse", async () => {
    expect(await hasValidDashboardRegistration("access-id", "visitor-id", "2.0", 14)).toBe(false);
    const [sql, values] = query.mock.lastCall!;
    expect(sql).toContain("anonymous_visitor_id = $2");
    expect(sql).toContain("consent_given = true and consent_version = $3");
    expect(sql).toContain("created_at > now() - ($4::integer * interval '1 day')");
    expect(values).toEqual(["access-id", "visitor-id", "2.0", 14]);
    query.mockResolvedValueOnce({ rows: [{ id: "access-id" }] });
    expect(await hasValidDashboardRegistration("access-id", "visitor-id", "2.0", 14)).toBe(true);
  });

  it("persists edited publication titles without replacing an omitted title", async () => {
    query.mockResolvedValue({ rows: [{ id: "publication-id", title: "Updated title" }] });
    expect(await updatePublication("publication-id", { title: " Updated title " })).toMatchObject({ title: "Updated title" });
    expect(query.mock.lastCall?.[0]).toContain("title = coalesce($11, title)");
    expect(query.mock.lastCall?.[1][10]).toBe("Updated title");
    await updatePublication("publication-id", { description: "Updated description" });
    expect(query.mock.lastCall?.[1][10]).toBeNull();
  });
});
