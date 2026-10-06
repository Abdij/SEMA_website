// @vitest-environment node
// Opt in with SECURITY_INTEGRATION=1. All fixtures live in connection-local temporary
// tables inside a rolled-back transaction; no application rows are changed.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { Client, type Pool } from "pg";
import env from "@next/env";
import { createAdminSession, requireAdminAuth, revokeAdminSession } from "@/lib/admin";
import { digest, enforceRateLimit } from "@/lib/security";
import { getCatalogueDatasetBySlug, getCatalogueDatasets, getCatalogueDistrictProfile, getCatalogueIndicators, getCatalogueRegionProfile } from "@/lib/db";

describe.skipIf(process.env.SECURITY_INTEGRATION !== "1")("PostgreSQL security integration", () => {
  let client: Client;
  let originalPassword: string | undefined;
  beforeAll(async () => {
    env.loadEnvConfig(process.cwd());
    originalPassword = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = "integration-only-secret";
    client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query("BEGIN");
    global.semaPool = client as unknown as Pool;
    for (const file of ["003_data_catalogue.sql", "004_security.sql"]) {
      const sql = readFileSync(`db/migrations/${file}`, "utf8")
        .replace(/^BEGIN;|^COMMIT;/gmi, "")
        .replace(/create table if not exists/gi, "create temporary table");
      await client.query(sql);
    }
  }, 30000);
  afterAll(async () => {
    if (client) { await client.query("ROLLBACK"); await client.end(); }
    global.semaPool = undefined;
    if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = originalPassword;
  });
  const request = (token: string) => new Request("https://sema.org.so/api/admin/news", { headers: { cookie: `sema_admin_session=${token}` } });

  it("stores only token hashes, rejects expiry, password rotation and revoked sessions", async () => {
    const token = await createAdminSession();
    const stored = (await client.query("select * from admin_sessions")).rows[0];
    expect(stored.token_hash).toBe(digest(token));
    expect(JSON.stringify(stored)).not.toContain(token);
    await expect(requireAdminAuth(request(token))).resolves.toBe(true);
    process.env.ADMIN_PASSWORD = "rotated-integration-secret";
    await expect(requireAdminAuth(request(token))).rejects.toMatchObject({ status: 401 });
    process.env.ADMIN_PASSWORD = "integration-only-secret";
    await client.query("update admin_sessions set expires_at = now() - interval '1 second'");
    await expect(requireAdminAuth(request(token))).rejects.toMatchObject({ status: 401 });
    const next = await createAdminSession();
    await revokeAdminSession(request(next));
    await expect(requireAdminAuth(request(next))).rejects.toMatchObject({ status: 401 });
  }, 30000);
  it("shares atomic limits across simultaneous calls and resets expired buckets", async () => {
    const results = await Promise.allSettled(Array.from({ length: 12 }, () => enforceRateLimit("integration", "one-client", 3, 60)));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(3);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(9);
    await client.query("update security_rate_limits set expires_at = now() - interval '1 second'");
    await expect(enforceRateLimit("integration", "one-client", 3, 60)).resolves.toBeUndefined();
  }, 30000);
  it("redacts restricted counts, dates and notes from every public summary, including rollups", async () => {
    const region = (await client.query("insert into catalogue_geo_areas(level,slug,name) values ('region','test-region','Test region') returning id")).rows[0].id;
    const district = (await client.query("insert into catalogue_geo_areas(level,parent_id,slug,name) values ('district',$1,'test-district','Test district') returning id", [region])).rows[0].id;
    const hidden = (await client.query("insert into catalogue_datasets(slug,name,category) values ('hidden','Restricted dataset','nts') returning id")).rows[0].id;
    const publicId = (await client.query("insert into catalogue_datasets(slug,name,category) values ('visible','Public dataset','eod') returning id")).rows[0].id;
    await client.query(`insert into catalogue_dataset_geo_stats(dataset_id,geo_area_id,record_count,settlements_represented,earliest_date,latest_date,access_classification,notes)
      values ($1,$2,98765,98765,'1901-01-01','2099-01-01','restricted','SECRET NOTE'),
             ($1,$3,98770,98765,'1901-01-01','2099-01-01','public','PARENT TOTAL'),
             ($4,$3,7,2,'2020-01-01','2021-01-01','public','Public note')`, [hidden, district, region, publicId]);
    const profiles = [await getCatalogueDistrictProfile("test-district"), await getCatalogueRegionProfile("test-region")];
    for (const profile of profiles) {
      const row = profile?.availability.find((item) => item.datasetSlug === "hidden");
      expect(row?.availability).toBe("restricted");
      for (const key of ["recordCount", "earliestDate", "latestDate", "notes"]) expect(row).not.toHaveProperty(key);
    }
    expect((profiles[1] as Awaited<ReturnType<typeof getCatalogueRegionProfile>>)?.districts[0].hasData).toBe(false);
    expect((await getCatalogueDatasets()).map((d) => d.slug)).toEqual(["visible"]);
    const indicators = await getCatalogueIndicators();
    expect(indicators).toMatchObject({ settlementsRepresented: 2, districtsRepresented: 0, earliestYear: 2020, latestYear: 2021 });
    const detail = await getCatalogueDatasetBySlug("hidden");
    expect(detail).toHaveProperty("availability", "restricted");
    expect(Object.keys(detail!)).toEqual(["dataset", "availability"]);
  }, 30000);
});
