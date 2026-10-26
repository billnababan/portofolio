import { describe, expect, it } from "vitest";
import { login, request } from "./helpers.js";

const BROWSER = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1";

describe("public endpoints", () => {
  it("counts page views and events without cookies, and ignores bots", async () => {
    const pv = await request()
      .post("/api/public/track")
      .set("User-Agent", BROWSER)
      .set("X-Vercel-IP-Country", "ID")
      .send({ type: "pageview", path: "/", referrer: "https://www.linkedin.com/feed/", utmSource: "LinkedIn-Post" });
    expect(pv.status).toBe(204);
    expect(pv.headers["set-cookie"]).toBeUndefined();
    await request().post("/api/public/track").set("User-Agent", BROWSER).send({ type: "event", name: "project_open", label: "edepot" });
    await request().post("/api/public/track").set("User-Agent", "Googlebot/2.1").send({ type: "pageview", path: "/" });
    const bad = await request().post("/api/public/track").set("User-Agent", BROWSER).send({ type: "event", name: "made_up" });
    expect(bad.status).toBe(422);

    const owner = await login();
    const report = (await owner.get("/api/analytics?range=7d")).body;
    expect(report.kpis.visitors.value).toBe(1);
    expect(report.kpis.pageviews.value).toBe(1);
    expect(report.sources[0].value).toBe("linkedin.com");
    expect(report.campaigns[0].value).toBe("linkedin-post");
    expect(report.devices[0].value).toBe("mobile");
    expect(report.countries[0].value).toBe("ID");
    expect(report.events.projects[0].label).toBe("E-Depot");
  });

  it("puts contact messages in the inbox and drops honeypot ones", async () => {
    const sent = await request().post("/api/public/contact").send({ name: "Rani", email: "rani@example.com", message: "We track containers in Excel.", page: "/" });
    expect(sent.status).toBe(201);
    const bot = await request().post("/api/public/contact").send({ name: "Bot", email: "bot@example.com", message: "Buy now", website: "http://spam" });
    expect(bot.status).toBe(201);
    const invalid = await request().post("/api/public/contact").send({ name: "", email: "nope", message: "" });
    expect(invalid.status).toBe(422);

    const owner = await login();
    const inbox = (await owner.get("/api/messages")).body;
    expect(inbox.messages.map((m: { name: string }) => m.name)).toEqual(["Rani"]);
    expect(inbox.counts.new).toBe(1);

    const opened = await owner.get(`/api/messages/${inbox.messages[0].id}`);
    expect(opened.body.message.status).toBe("read");
    expect((await owner.patch(`/api/messages/${inbox.messages[0].id}`).send({ status: "archived" })).status).toBe(204);
    expect((await owner.get("/api/messages?status=archived")).body.total).toBe(1);
    expect((await owner.get("/api/messages?q=excel&status=archived")).body.total).toBe(1);
  });
});
