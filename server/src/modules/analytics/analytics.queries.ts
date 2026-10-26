import { execute, select, selectOne, type Db } from "../../db/pool.js";

type Window = { from: Date; to?: Date };

const between = (w: Window) => (w.to ? `created_at >= ? AND created_at < ?` : `created_at >= ?`);
const args = (w: Window) => (w.to ? [w.from, w.to] : [w.from]);

export const insertPageView = (
  db: Db,
  v: { visitor: string; path: string; referrerHost: string; utmSource: string; device: string; browser: string; country: string },
) =>
  execute(
    db,
    `INSERT INTO page_views (visitor, path, referrer_host, utm_source, device, browser, country) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [v.visitor, v.path, v.referrerHost, v.utmSource, v.device, v.browser, v.country],
  );

export const insertEvent = (db: Db, e: { visitor: string; name: string; label: string; path: string }) =>
  execute(db, `INSERT INTO events (visitor, name, label, path) VALUES (?, ?, ?, ?)`, [e.visitor, e.name, e.label, e.path]);

// Visitors are counted per day (the hash changes daily), then summed over the window.
export const totals = async (db: Db, w: Window) => {
  const row = await selectOne<{ visitors: number | null; pageviews: number | null }>(
    db,
    `SELECT SUM(v) AS visitors, SUM(p) AS pageviews
       FROM (SELECT DATE(created_at) AS day, COUNT(DISTINCT visitor) AS v, COUNT(*) AS p
               FROM page_views WHERE ${between(w)} GROUP BY day) d`,
    args(w),
  );
  return { visitors: Number(row?.visitors ?? 0), pageviews: Number(row?.pageviews ?? 0) };
};

export const dailySeries = (db: Db, w: Window) =>
  select<{ day: string; visitors: number; pageviews: number }>(
    db,
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(DISTINCT visitor) AS visitors, COUNT(*) AS pageviews
       FROM page_views WHERE ${between(w)}
      GROUP BY day ORDER BY day`,
    args(w),
  );

export const eventTotals = (db: Db, w: Window) =>
  select<{ name: string; total: number; visitors: number }>(
    db,
    `SELECT name, COUNT(*) AS total, COUNT(DISTINCT visitor) AS visitors FROM events WHERE ${between(w)} GROUP BY name`,
    args(w),
  );

export const eventDaily = (db: Db, name: string, w: Window) =>
  select<{ day: string; total: number }>(
    db,
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS total
       FROM events WHERE name = ? AND ${between(w)} GROUP BY day ORDER BY day`,
    [name, ...args(w)],
  );

export const eventLabels = (db: Db, name: string, w: Window, limit = 10) =>
  select<{ label: string; total: number }>(
    db,
    `SELECT label, COUNT(*) AS total FROM events WHERE name = ? AND ${between(w)}
      GROUP BY label ORDER BY total DESC, label LIMIT ?`,
    [name, ...args(w), limit],
  );

// Grouped breakdowns of page views by one column (whitelisted, never user input).
const BREAKDOWNS = {
  referrer_host: "referrer_host",
  utm_source: "utm_source",
  device: "device",
  browser: "browser",
  country: "country",
  path: "path",
} as const;

export const breakdown = (db: Db, column: keyof typeof BREAKDOWNS, w: Window, limit = 8) =>
  select<{ value: string; visitors: number; pageviews: number }>(
    db,
    `SELECT ${BREAKDOWNS[column]} AS value, COUNT(DISTINCT visitor, DATE(created_at)) AS visitors, COUNT(*) AS pageviews
       FROM page_views WHERE ${between(w)}
      GROUP BY value ORDER BY visitors DESC, value LIMIT ?`,
    [...args(w), limit],
  );

export const liveVisitors = async (db: Db) => {
  const row = await selectOne<{ total: number }>(
    db,
    `SELECT COUNT(DISTINCT visitor) AS total FROM page_views WHERE created_at >= UTC_TIMESTAMP() - INTERVAL 30 MINUTE`,
  );
  return Number(row?.total ?? 0);
};

export const messagesInWindow = async (db: Db, w: Window) => {
  const row = await selectOne<{ total: number }>(db, `SELECT COUNT(*) AS total FROM messages WHERE status <> 'spam' AND ${between(w)}`, args(w));
  return Number(row?.total ?? 0);
};

export const messagesDaily = (db: Db, w: Window) =>
  select<{ day: string; total: number }>(
    db,
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS total FROM messages
      WHERE status <> 'spam' AND ${between(w)} GROUP BY day ORDER BY day`,
    args(w),
  );

// Keep a little over a year of raw analytics.
export const pruneAnalytics = async (db: Db) => {
  await execute(db, `DELETE FROM page_views WHERE created_at < UTC_TIMESTAMP() - INTERVAL 400 DAY`);
  await execute(db, `DELETE FROM events WHERE created_at < UTC_TIMESTAMP() - INTERVAL 400 DAY`);
  await execute(db, `DELETE FROM analytics_salts WHERE day < UTC_DATE() - INTERVAL 2 DAY`);
};
