// Fills an EMPTY-of-traffic development database with made-up visits, events,
// messages and Search Console rows, so the dashboard can be tried before the site
// has real traffic. Refuses to run in production.
// Usage: npm run db:seed:demo
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";
import { execute, pool, selectOne } from "./pool.js";

// Deterministic pseudo-random numbers, so every demo looks the same.
let state = 42;
const rand = () => {
  state = (state * 1_103_515_245 + 12_345) % 2 ** 31;
  return state / 2 ** 31;
};
const pick = <T>(items: [T, number][]): T => {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [item, w] of items) if ((r -= w) <= 0) return item;
  return items[0]![0];
};
const hex = (n: number) => Array.from({ length: n }, () => Math.floor(rand() * 16).toString(16)).join("");
const at = (day: Date, hour: number) => new Date(Math.min(Date.now() - 60_000, day.getTime() + hour * 3_600_000 + Math.floor(rand() * 3_600_000)));

const SOURCES: [string, number][] = [["", 34], ["linkedin.com", 24], ["google.com", 18], ["github.com", 9], ["l.instagram.com", 7], ["t.co", 3], ["bing.com", 2], ["duckduckgo.com", 1]];
const DEVICES: [string, number][] = [["mobile", 55], ["desktop", 41], ["tablet", 4]];
const BROWSERS: [string, number][] = [["Chrome", 62], ["Safari", 21], ["Edge", 7], ["Samsung Internet", 5], ["Firefox", 5]];
const COUNTRIES: [string, number][] = [["ID", 71], ["SG", 9], ["MY", 6], ["US", 6], ["AU", 3], ["NL", 2], ["", 3]];
const PROJECTS: [string, number][] = [["edepot", 38], ["kpp-reminders", 27], ["taskflow", 14], ["trufflehog", 9], ["collaboration", 7], ["minutes-archive", 5]];

const DAYS = 120;

export const seedDemo = async () => {
  if (env.isProduction) throw new Error("seed:demo: refusing to add made-up data in production.");
  const existing = await selectOne<{ total: number }>(pool, `SELECT COUNT(*) AS total FROM page_views`);
  if (Number(existing?.total) > 0) throw new Error("seed:demo: there is already traffic data. Run it on a fresh database.");

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const views: unknown[][] = [];
  const events: unknown[][] = [];

  for (let d = DAYS - 1; d >= 0; d--) {
    const day = new Date(today.getTime() - d * 86_400_000);
    const weekday = day.getUTCDay();
    // Slow growth, quieter weekends, and a few spikes the day a post went out.
    const growth = 1 + (DAYS - d) / DAYS;
    const weekend = weekday === 0 || weekday === 6 ? 0.65 : 1;
    const spike = [9, 33, 61, 88, 104].includes(d) ? 3.2 : 1;
    const visitors = Math.round((14 + rand() * 10) * growth * weekend * spike);

    for (let v = 0; v < visitors; v++) {
      const visitor = hex(16);
      const source = spike > 1 && rand() < 0.6 ? "linkedin.com" : pick(SOURCES);
      const device = pick(DEVICES);
      const browser = device === "mobile" && rand() < 0.35 ? "Safari" : pick(BROWSERS);
      const country = pick(COUNTRIES);
      const utm = source === "linkedin.com" && rand() < 0.4 ? "linkedin-post" : "";
      // Today only has the hours that have already passed.
      const hour = Math.floor(rand() * (d === 0 ? Math.max(1, new Date().getUTCHours()) : 24));
      const pages = 1 + (rand() < 0.18 ? 1 : 0);
      for (let p = 0; p < pages; p++) views.push([visitor, "/", source, utm, device, browser, country, at(day, hour)]);

      if (rand() < 0.42) events.push([visitor, "project_open", pick(PROJECTS), "/", at(day, hour)]);
      if (rand() < 0.16) events.push([visitor, "project_open", pick(PROJECTS), "/", at(day, hour)]);
      if (rand() < 0.065) events.push([visitor, "cv_download", rand() < 0.7 ? "story" : "footer", "/", at(day, hour)]);
      if (rand() < 0.03) events.push([visitor, "email_click", "contact", "/", at(day, hour)]);
      if (rand() < 0.05) events.push([visitor, "social_click", pick([["GitHub", 5], ["LinkedIn", 4], ["Instagram", 2]]), "/", at(day, hour)]);
      if (rand() < 0.04) events.push([visitor, "source_click", pick([["kpp-reminders:source", 4], ["taskflow:source", 3], ["cert:rhcsa", 2]]), "/", at(day, hour)]);
    }
  }

  for (let i = 0; i < views.length; i += 1000) {
    await execute(pool, `INSERT INTO page_views (visitor, path, referrer_host, utm_source, device, browser, country, created_at) VALUES ?`, [views.slice(i, i + 1000)]);
  }
  for (let i = 0; i < events.length; i += 1000) {
    await execute(pool, `INSERT INTO events (visitor, name, label, path, created_at) VALUES ?`, [events.slice(i, i + 1000)]);
  }

  // Contact messages (made up).
  const messages: [string, string, string, number, string][] = [
    ["Rani Putri", "rani.putri@example.com", "Hi Bill, we run a small logistics company in Batam and still track containers in Excel. Saw your E-Depot story — could we talk about something similar for us? We have 2 yards.", 0, "new"],
    ["Andreas Simanjuntak", "andreas@example.co.id", "Halo, apakah bisa bantu buat sistem reminder untuk jadwal maintenance alat berat? Mirip yang untuk KPP. Budget kami terbatas tapi butuh cepat.", 1, "new"],
    ["Mei Ling", "meiling.hr@example.sg", "We're hiring a fullstack developer (Node + React) for a remote role. Would you be open to a 30-minute call next week?", 3, "read"],
    ["Dimas Pratama", "dimas.p@example.com", "Mas, saya mahasiswa Polibatam. Boleh tanya cara belajar backend dari nol? Terima kasih.", 6, "read"],
    ["SEO Booster", "offers@example.net", "We can get your website to page 1 of Google in 7 days!!! Cheap price, click here.", 8, "spam"],
    ["Yohana Sitorus", "yohana@example.com", "Thanks for the call yesterday. Sending the requirement doc for the warehouse app by Friday.", 12, "archived"],
    ["Kevin Tan", "kevin.tan@example.com", "Is the TaskFlow project open source? I'd like to fork it for my team.", 15, "read"],
  ];
  for (const [name, email, body, daysAgo, status] of messages) {
    await execute(
      pool,
      `INSERT INTO messages (name, email, body, status, source_page, visitor, created_at, read_at)
       VALUES (?, ?, ?, ?, '/', ?, UTC_TIMESTAMP() - INTERVAL ? DAY - INTERVAL ? MINUTE, IF(? = 'new', NULL, UTC_TIMESTAMP()))`,
      [name, email, body, status, hex(16), daysAgo, Math.floor(rand() * 600), status],
    );
  }

  // Search Console rows (made up), ending three days ago like the real data.
  const queries: [string, number, number][] = [
    ["bill jeferson", 1.4, 0.3],
    ["bill jeferson nababan", 1.1, 0.25],
    ["fullstack developer batam", 9.5, 0.08],
    ["web developer batam", 12.8, 0.06],
    ["jasa pembuatan website batam", 24.0, 0.02],
    ["sistem depo container", 18.2, 0.03],
    ["aplikasi reminder whatsapp", 21.5, 0.02],
    ["node.js express developer", 38.0, 0.01],
    ["react developer indonesia", 44.0, 0.005],
  ];
  const rows: unknown[][] = [];
  for (let d = 92; d >= 3; d--) {
    const day = new Date(today.getTime() - d * 86_400_000).toISOString().slice(0, 10);
    const trend = 1 + (92 - d) / 120;
    let dayClicks = 0;
    let dayImpr = 0;
    let posSum = 0;
    for (const [q, basePos, baseCtr] of queries) {
      const impressions = Math.max(0, Math.round((basePos < 5 ? 6 : 14) * trend * (0.5 + rand())));
      if (impressions === 0) continue;
      // Positions slowly improve for the location keywords.
      const position = Math.max(1, basePos * (q.includes("batam") ? 1.25 - (92 - d) / 260 : 1) + (rand() - 0.5) * 2);
      const clicks = Math.round(impressions * baseCtr * (0.5 + rand()));
      rows.push([day, "query", q, clicks, impressions, impressions ? clicks / impressions : 0, position]);
      dayClicks += clicks;
      dayImpr += impressions;
      posSum += position * impressions;
    }
    rows.push([day, "date", "", dayClicks, dayImpr, dayImpr ? dayClicks / dayImpr : 0, dayImpr ? posSum / dayImpr : 0]);
    rows.push([day, "page", `${env.siteUrl}/`, dayClicks, dayImpr, dayImpr ? dayClicks / dayImpr : 0, dayImpr ? posSum / dayImpr : 0]);
  }
  for (let i = 0; i < rows.length; i += 1000) {
    await execute(pool, `INSERT INTO search_console_rows (day, dimension, item_key, clicks, impressions, ctr, position) VALUES ?`, [rows.slice(i, i + 1000)]);
  }

  // Nightly audit scores for the trend chart. No checks are stored: run a real audit for those.
  const audits: unknown[][] = [];
  for (let d = 21; d >= 1; d--) {
    const score = Math.min(96, Math.round(70 + (21 - d) * 1.1 + rand() * 4));
    audits.push([`${env.siteUrl}/`, score, 200, 80 + Math.floor(rand() * 120), 62_000, "[]", "schedule", at(new Date(today.getTime() - d * 86_400_000), 2.5)]);
  }
  await execute(pool, `INSERT INTO seo_audits (url, score, status_code, response_ms, html_bytes, checks, trigger_type, created_at) VALUES ?`, [audits]);

  return { views: views.length, events: events.length, messages: messages.length, searchRows: rows.length, audits: audits.length };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await seedDemo();
  console.log(`seed:demo: ${result.views} page views, ${result.events} events, ${result.messages} messages, ${result.searchRows} search rows, ${result.audits} audits`);
  await pool.end();
}
