import { execute, select, selectOne, type Db } from "../../db/pool.js";
import type { Check } from "./seo.audit.js";

export type AuditRow = {
  id: number;
  url: string;
  score: number;
  status_code: number;
  response_ms: number;
  html_bytes: number;
  checks: Check[];
  trigger_type: "manual" | "schedule" | "publish";
  created_at: Date;
  created_by_name: string | null;
};

export const insertAudit = async (
  db: Db,
  a: { url: string; score: number; statusCode: number; responseMs: number; htmlBytes: number; checks: Check[]; trigger: AuditRow["trigger_type"]; userId: number | null },
) => {
  const result = await execute(
    db,
    `INSERT INTO seo_audits (url, score, status_code, response_ms, html_bytes, checks, trigger_type, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [a.url, a.score, a.statusCode, a.responseMs, a.htmlBytes, JSON.stringify(a.checks), a.trigger, a.userId],
  );
  return result.insertId;
};

const AUDIT_COLUMNS = `a.id, a.url, a.score, a.status_code, a.response_ms, a.html_bytes, a.checks, a.trigger_type, a.created_at,
                       u.name AS created_by_name`;

export const findAudit = (db: Db, id: number) =>
  selectOne<AuditRow>(db, `SELECT ${AUDIT_COLUMNS} FROM seo_audits a LEFT JOIN users u ON u.id = a.created_by WHERE a.id = ?`, [id]);

export const latestAudit = (db: Db) =>
  selectOne<AuditRow>(db, `SELECT ${AUDIT_COLUMNS} FROM seo_audits a LEFT JOIN users u ON u.id = a.created_by ORDER BY a.id DESC LIMIT 1`);

export const auditHistory = (db: Db, limit = 30) =>
  select<{ id: number; score: number; trigger_type: string; created_at: Date; fails: number; warns: number }>(
    db,
    `SELECT id, score, trigger_type, created_at,
            JSON_LENGTH(JSON_SEARCH(checks, 'all', 'fail', NULL, '$[*].status')) AS fails,
            JSON_LENGTH(JSON_SEARCH(checks, 'all', 'warn', NULL, '$[*].status')) AS warns
       FROM seo_audits ORDER BY id DESC LIMIT ?`,
    [limit],
  );

export type SearchRow = { day: string; dimension: "date" | "query" | "page"; key: string; clicks: number; impressions: number; ctr: number; position: number };

export const upsertSearchRows = async (db: Db, rows: SearchRow[]) => {
  // Batches keep each statement well under max_allowed_packet.
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    await execute(
      db,
      `INSERT INTO search_console_rows (day, dimension, item_key, clicks, impressions, ctr, position) VALUES ? AS new
       ON DUPLICATE KEY UPDATE clicks = new.clicks, impressions = new.impressions, ctr = new.ctr, position = new.position, synced_at = UTC_TIMESTAMP()`,
      [batch.map((r) => [r.day, r.dimension, r.key.slice(0, 500), r.clicks, r.impressions, r.ctr, r.position])],
    );
  }
};

type Window = { from: string; to: string }; // YYYY-MM-DD, inclusive

export const searchTotals = async (db: Db, w: Window) => {
  const row = await selectOne<{ clicks: number | null; impressions: number | null; position: number | null }>(
    db,
    `SELECT SUM(clicks) AS clicks, SUM(impressions) AS impressions,
            SUM(position * impressions) / NULLIF(SUM(impressions), 0) AS position
       FROM search_console_rows WHERE dimension = 'date' AND day BETWEEN ? AND ?`,
    [w.from, w.to],
  );
  const clicks = Number(row?.clicks ?? 0);
  const impressions = Number(row?.impressions ?? 0);
  return { clicks, impressions, ctr: impressions > 0 ? clicks / impressions : 0, position: Number(row?.position ?? 0) };
};

export const searchSeries = (db: Db, w: Window) =>
  select<{ day: string; clicks: number; impressions: number; position: number }>(
    db,
    `SELECT DATE_FORMAT(day, '%Y-%m-%d') AS day, clicks, impressions, position
       FROM search_console_rows WHERE dimension = 'date' AND day BETWEEN ? AND ? ORDER BY day`,
    [w.from, w.to],
  );

// Top queries or pages over the window; position is weighted by impressions.
export const searchTop = (db: Db, dimension: "query" | "page", w: Window, limit = 20) =>
  select<{ key: string; clicks: number; impressions: number; position: number }>(
    db,
    `SELECT item_key AS \`key\`, SUM(clicks) AS clicks, SUM(impressions) AS impressions,
            SUM(position * impressions) / NULLIF(SUM(impressions), 0) AS position
       FROM search_console_rows WHERE dimension = ? AND day BETWEEN ? AND ?
      GROUP BY item_key ORDER BY clicks DESC, impressions DESC LIMIT ?`,
    [dimension, w.from, w.to, limit],
  );

export const keywordStats = (db: Db, keywords: string[], w: Window) =>
  keywords.length === 0
    ? Promise.resolve([] as { key: string; clicks: number; impressions: number; position: number }[])
    : select<{ key: string; clicks: number; impressions: number; position: number }>(
        db,
        `SELECT LOWER(item_key) AS \`key\`, SUM(clicks) AS clicks, SUM(impressions) AS impressions,
                SUM(position * impressions) / NULLIF(SUM(impressions), 0) AS position
           FROM search_console_rows
          WHERE dimension = 'query' AND LOWER(item_key) IN (?) AND day BETWEEN ? AND ?
          GROUP BY LOWER(item_key)`,
        [keywords.map((k) => k.toLowerCase()), w.from, w.to],
      );

export const lastSearchSync = async (db: Db) => {
  const row = await selectOne<{ synced_at: Date | null; last_day: string | null }>(
    db,
    `SELECT MAX(synced_at) AS synced_at, DATE_FORMAT(MAX(day), '%Y-%m-%d') AS last_day FROM search_console_rows`,
  );
  return { syncedAt: row?.synced_at ?? null, lastDay: row?.last_day ?? null };
};
