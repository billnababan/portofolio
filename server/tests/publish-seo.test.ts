import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { login } from "./helpers.js";

// A fake Vercel deploy hook and the built site (../dist) served on the SITE_URL port.
const hookCalls: string[] = [];
const hook = http.createServer((req, res) => {
  hookCalls.push(`${req.method} ${req.url}`);
  res.writeHead(201, { "Content-Type": "application/json" }).end('{"job":{"id":"test","state":"PENDING"}}');
});
const dist = path.resolve("../dist");
const site = http.createServer((req, res) => {
  const file = path.join(dist, req.url === "/" ? "index.html" : decodeURIComponent(req.url!.split("?")[0]!));
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return void res.writeHead(404).end();
  res.writeHead(200).end(fs.readFileSync(file));
});

beforeAll(async () => {
  await new Promise<void>((r) => hook.listen(4599, "127.0.0.1", r));
  await new Promise<void>((r) => site.listen(4598, "127.0.0.1", r));
});
afterAll(() => {
  hook.close();
  site.close();
});

describe("publish", () => {
  it("calls the deploy hook and clears the pending list", async () => {
    const owner = await login();
    const { settings } = (await owner.get("/api/settings")).body;
    await owner.put("/api/settings/marquee").send([...settings.marquee, "TypeScript"]);
    const before = (await owner.get("/api/publish")).body;
    expect(before.configured).toBe(true);
    expect(before.pending[0].summary).toBe("Edited Marquee");

    const res = await owner.post("/api/publish").send({ note: "test publish" });
    expect(res.status).toBe(201);
    expect(hookCalls).toEqual(["POST /hook"]);

    const after = (await owner.get("/api/publish")).body;
    expect(after.pending).toEqual([]);
    expect(after.history[0].note).toBe("test publish");
  });
});

describe("seo", () => {
  it.skipIf(!fs.existsSync(path.join(dist, "index.html")))("audits the built site and stores the result", async () => {
    const owner = await login();
    const { settings } = (await owner.get("/api/settings")).body;
    await owner.put("/api/settings/seo").send({ ...settings.seo, siteUrl: "http://127.0.0.1:4598" });

    const res = await owner.post("/api/seo/audits");
    expect(res.status).toBe(201);
    const checks = Object.fromEntries(res.body.audit.checks.map((c: { id: string; status: string }) => [c.id, c.status]));
    expect(checks.status).toBe("pass");
    expect(checks.title).toBe("pass");
    expect(checks.h1).toBe("pass");
    expect(checks.img_alt).toBe("pass");
    expect(checks.https).toBe("fail"); // the local test server is plain HTTP
    expect(res.body.audit.score).toBeGreaterThan(50);

    const overview = (await owner.get("/api/seo")).body;
    expect(overview.latestAudit.id).toBe(res.body.audit.id);
    expect(overview.history.at(-1).score).toBe(res.body.audit.score);
  });

  it("reports Search Console as not connected without credentials", async () => {
    const owner = await login();
    const res = await owner.post("/api/seo/search/sync");
    expect(res.status).toBe(400);
    expect((await owner.get("/api/seo/search?range=30d")).body.connected).toBe(false);
  });
});

describe("dashboard", () => {
  it("returns everything in one request", async () => {
    const owner = await login();
    const res = await owner.get("/api/dashboard?range=7d");
    expect(res.status).toBe(200);
    expect(res.body.traffic.days).toHaveLength(7);
    expect(res.body.seo.score).toBeGreaterThan(0);
    expect(res.body.content.projects_shown).toBeGreaterThan(0);
    expect(Array.isArray(res.body.notes)).toBe(true);
  });
});
