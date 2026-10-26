import type { RequestHandler } from "express";
import { integrations } from "../../config/env.js";
import { pool, select } from "../../db/pool.js";
import { rangeSchema } from "../../lib/range.js";
import { activityDto } from "../activity/activity.controller.js";
import { listActivity } from "../activity/activity.queries.js";
import { trafficReport } from "../analytics/analytics.report.js";
import { latestMessages, messageCounts } from "../messages/messages.queries.js";
import { lastSuccessfulPublish, pendingChanges } from "../publish/publish.queries.js";
import type { Check } from "../seo/seo.audit.js";
import { auditHistory, latestAudit, searchTotals, lastSearchSync } from "../seo/seo.queries.js";

const pct = (now: number, before: number) => (before === 0 ? null : Math.round(((now - before) / before) * 100));

const contentCounts = async () => {
  const rows = await select<{ what: string; total: number }>(
    pool,
    `SELECT 'projects_shown' AS what, COUNT(*) AS total FROM projects WHERE status = 'published'
     UNION ALL SELECT 'projects_hidden', COUNT(*) FROM projects WHERE status = 'draft'
     UNION ALL SELECT 'certifications', COUNT(*) FROM certifications WHERE status = 'published'
     UNION ALL SELECT 'skills', COUNT(*) FROM skills
     UNION ALL SELECT 'media', COUNT(*) FROM media`,
  );
  return Object.fromEntries(rows.map((r) => [r.what, Number(r.total)]));
};

// One request for the whole dashboard.
export const dashboard: RequestHandler = async (req, res) => {
  const range = rangeSchema.parse(req.query.range);
  const last = await lastSuccessfulPublish(pool);
  const [traffic, audit, history, counts, inbox, pending, activity, content, sync] = await Promise.all([
    trafficReport(range),
    latestAudit(pool),
    auditHistory(pool, 12),
    messageCounts(pool),
    latestMessages(pool, 5),
    pendingChanges(pool, last?.last_activity_id ?? 0),
    listActivity(pool, { limit: 8, before: null, userId: null }),
    contentCounts(),
    lastSearchSync(pool),
  ]);

  let search = null;
  if (sync.lastDay) {
    const end = new Date(`${sync.lastDay}T00:00:00Z`);
    const from = new Date(end.getTime() - 27 * 86_400_000);
    const prevEnd = new Date(from.getTime() - 86_400_000);
    const prevFrom = new Date(prevEnd.getTime() - 27 * 86_400_000);
    const d = (x: Date) => x.toISOString().slice(0, 10);
    const [now, before] = await Promise.all([searchTotals(pool, { from: d(from), to: d(end) }), searchTotals(pool, { from: d(prevFrom), to: d(prevEnd) })]);
    search = { ...now, previous: before, lastDay: sync.lastDay };
  }

  const newMessages = Number(counts.find((c) => c.status === "new")?.total ?? 0);
  const failing = audit ? (audit.checks as Check[]).filter((c) => c.status === "fail") : [];

  // Plain observations computed from the numbers above — shown as "Notes".
  const notes: { tone: "good" | "bad" | "neutral"; text: string; link: string }[] = [];
  const k = traffic.kpis;
  const change = pct(k.visitors.value, k.visitors.previous);
  if (change !== null && Math.abs(change) >= 10) {
    notes.push({ tone: change > 0 ? "good" : "bad", text: `Visitors ${change > 0 ? "up" : "down"} ${Math.abs(change)}% on the previous ${traffic.days.length} days.`, link: "/analytics" });
  }
  const topSource = traffic.sources.find((s) => s.value !== "Direct / none");
  if (topSource && k.visitors.value > 0) {
    notes.push({ tone: "neutral", text: `${topSource.value} sends the most visitors (${Math.round((topSource.visitors / k.visitors.value) * 100)}%).`, link: "/analytics" });
  }
  const topProject = traffic.events.projects[0];
  if (topProject) notes.push({ tone: "neutral", text: `“${topProject.label}” is the most opened project (${topProject.total} opens).`, link: "/content/projects" });
  if (failing.length > 0) notes.push({ tone: "bad", text: `${failing.length} SEO check${failing.length > 1 ? "s" : ""} failing: ${failing.slice(0, 2).map((f) => f.label.toLowerCase()).join(", ")}.`, link: "/seo" });
  if (pending.length > 0) notes.push({ tone: "neutral", text: `${pending.length} change${pending.length > 1 ? "s are" : " is"} not live yet.`, link: "/publish" });
  if (newMessages > 0) notes.push({ tone: "good", text: `${newMessages} new message${newMessages > 1 ? "s" : ""} in the inbox.`, link: "/inbox" });

  res.json({
    range,
    traffic: {
      days: traffic.days,
      live: traffic.live,
      kpis: traffic.kpis,
      series: traffic.series,
      previousVisitors: traffic.previousVisitors,
      sources: traffic.sources.slice(0, 5),
      devices: traffic.devices,
      projects: traffic.events.projects.slice(0, 5),
    },
    seo: audit
      ? {
          score: audit.score,
          createdAt: audit.created_at,
          fails: failing.length,
          warns: (audit.checks as Check[]).filter((c) => c.status === "warn").length,
          history: history.reverse().map((h) => ({ score: h.score, createdAt: h.created_at })),
        }
      : null,
    search: { connected: integrations.searchConsole, data: search },
    inbox: {
      newCount: newMessages,
      latest: inbox.map((m) => ({ id: m.id, name: m.name, email: m.email, excerpt: m.body.slice(0, 140), status: m.status, createdAt: m.created_at })),
    },
    publish: { configured: integrations.publish, lastPublishedAt: last?.created_at ?? null, pendingCount: pending.length },
    activity: activity.map(activityDto),
    content,
    notes,
  });
};
