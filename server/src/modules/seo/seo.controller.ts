import type { RequestHandler } from "express";
import { integrations } from "../../config/env.js";
import { pool } from "../../db/pool.js";
import { logActivity } from "../../lib/activity.js";
import { notFound } from "../../lib/errors.js";
import { rangeSchema, rangeDays } from "../../lib/range.js";
import { currentUser, idParam } from "../../lib/request.js";
import { findMedia } from "../media/media.queries.js";
import { ogFile } from "../media/media.storage.js";
import { getSetting } from "../settings/settings.queries.js";
import { auditHistory, findAudit, keywordStats, lastSearchSync, latestAudit, searchSeries, searchTop, searchTotals, type AuditRow } from "./seo.queries.js";
import { auditAndStore, syncSearchConsole } from "./seo.service.js";

const auditDto = (a: AuditRow) => ({
  id: a.id,
  url: a.url,
  score: a.score,
  statusCode: a.status_code,
  responseMs: a.response_ms,
  htmlBytes: a.html_bytes,
  checks: a.checks,
  trigger: a.trigger_type,
  createdAt: a.created_at,
  createdBy: a.created_by_name,
});

export const overview: RequestHandler = async (_req, res) => {
  const settings = await getSetting(pool, "seo");
  const og = await findMedia(pool, settings.ogImageId);
  const [latest, history, sync] = await Promise.all([latestAudit(pool), auditHistory(pool), lastSearchSync(pool)]);
  res.json({
    settings,
    ogImageUrl: og ? `/media/${ogFile(og.name, og.version)}` : null,
    latestAudit: latest ? auditDto(latest) : null,
    history: history.reverse().map((h) => ({ id: h.id, score: h.score, trigger: h.trigger_type, createdAt: h.created_at, fails: Number(h.fails ?? 0), warns: Number(h.warns ?? 0) })),
    searchConsole: { connected: integrations.searchConsole, ...sync },
  });
};

export const runNow: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = await auditAndStore("manual", user.id);
  const audit = await findAudit(pool, id);
  await logActivity(pool, { userId: user.id, action: "seo.audit", entityType: "seo_audit", entityId: id, summary: `Ran an SEO audit (score ${audit!.score})` });
  res.status(201).json({ audit: auditDto(audit!) });
};

export const getAudit: RequestHandler = async (req, res) => {
  const audit = await findAudit(pool, idParam(req));
  if (!audit) throw notFound("Audit");
  res.json({ audit: auditDto(audit) });
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

// Search performance for the range, ending at the last day Google has data for.
export const search: RequestHandler = async (req, res) => {
  const range = rangeSchema.parse(req.query.range);
  const days = rangeDays(range);
  const sync = await lastSearchSync(pool);
  const end = sync.lastDay ? new Date(`${sync.lastDay}T00:00:00Z`) : new Date();
  const from = new Date(end.getTime() - (days - 1) * 86_400_000);
  const prevTo = new Date(from.getTime() - 86_400_000);
  const prevFrom = new Date(prevTo.getTime() - (days - 1) * 86_400_000);
  const cur = { from: iso(from), to: iso(end) };
  const prev = { from: iso(prevFrom), to: iso(prevTo) };
  const settings = await getSetting(pool, "seo");

  const [totals, totalsPrev, series, queries, pages, kw, kwPrev] = await Promise.all([
    searchTotals(pool, cur),
    searchTotals(pool, prev),
    searchSeries(pool, cur),
    searchTop(pool, "query", cur),
    searchTop(pool, "page", cur, 10),
    keywordStats(pool, settings.keywords, cur),
    keywordStats(pool, settings.keywords, prev),
  ]);

  const n = <T extends { clicks: number; impressions: number; position: number }>(r: T) => ({
    ...r,
    clicks: Number(r.clicks),
    impressions: Number(r.impressions),
    position: Number(r.position ?? 0),
    ctr: Number(r.impressions) > 0 ? Number(r.clicks) / Number(r.impressions) : 0,
  });

  res.json({
    connected: integrations.searchConsole,
    range,
    window: cur,
    ...sync,
    totals,
    previous: totalsPrev,
    series: series.map(n),
    queries: queries.map(n),
    pages: pages.map(n),
    keywords: settings.keywords.map((keyword) => {
      const now = kw.find((k) => k.key === keyword.toLowerCase());
      const before = kwPrev.find((k) => k.key === keyword.toLowerCase());
      return {
        keyword,
        clicks: Number(now?.clicks ?? 0),
        impressions: Number(now?.impressions ?? 0),
        position: now ? Number(now.position) : null,
        previousPosition: before ? Number(before.position) : null,
      };
    }),
  });
};

export const sync: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const rows = await syncSearchConsole();
  await logActivity(pool, { userId: user.id, action: "seo.sync", summary: `Synced Search Console (${rows} rows)` });
  res.json({ rows });
};
