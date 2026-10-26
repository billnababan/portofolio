import type { RequestHandler } from "express";
import { z } from "zod";
import { env, integrations } from "../../config/env.js";
import { pool } from "../../db/pool.js";
import { logActivity } from "../../lib/activity.js";
import { HttpError, badRequest } from "../../lib/errors.js";
import { currentUser } from "../../lib/request.js";
import { optionalText } from "../../lib/schema.js";
import { auditAndStore } from "../seo/seo.service.js";
import { insertPublish, lastSuccessfulPublish, newestActivityId, pendingChanges, publishHistory } from "./publish.queries.js";

const AUDIT_AFTER_PUBLISH_MS = 4 * 60_000;

export const status: RequestHandler = async (_req, res) => {
  const last = await lastSuccessfulPublish(pool);
  const [pending, history] = await Promise.all([pendingChanges(pool, last?.last_activity_id ?? 0), publishHistory(pool)]);
  res.json({
    configured: integrations.publish,
    lastPublishedAt: last?.created_at ?? null,
    pending: pending.map((p) => ({ id: p.id, action: p.action, summary: p.summary, user: p.user_name, createdAt: p.created_at })),
    history: history.map((h) => ({ id: h.id, status: h.status, note: h.note, response: h.response, user: h.user_name, createdAt: h.created_at })),
  });
};

// Calls the Vercel deploy hook. Vercel then runs `npm run content:pull && npm run build`,
// which reads the published content from this server.
export const publish: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const { note } = z.object({ note: optionalText(200) }).parse(req.body ?? {});
  if (!integrations.publish) throw badRequest("Publishing is not set up. Add VERCEL_DEPLOY_HOOK_URL to the server environment.");

  // Taken before calling the hook: edits made while the build runs stay pending.
  const lastActivityId = await newestActivityId(pool);
  let ok = false;
  let response = "";
  try {
    const hook = await fetch(env.VERCEL_DEPLOY_HOOK_URL, { method: "POST", signal: AbortSignal.timeout(10_000) });
    response = `${hook.status} ${(await hook.text()).slice(0, 400)}`;
    ok = hook.ok;
  } catch (err) {
    response = err instanceof Error ? err.message : "Request failed";
  }

  const id = await insertPublish(pool, { status: ok ? "triggered" : "failed", note, response, userId: user.id, lastActivityId });
  await logActivity(pool, { userId: user.id, action: ok ? "publish.trigger" : "publish.fail", entityType: "publish", entityId: id, summary: ok ? "Published the site" : "Publish failed" });
  if (!ok) throw new HttpError(502, `Vercel did not accept the deploy: ${response}`);

  // Re-check SEO once the new build is likely live. Failures here only affect the audit.
  setTimeout(() => {
    auditAndStore("publish", user.id).catch((err) => console.error("audit after publish failed:", err.message));
  }, AUDIT_AFTER_PUBLISH_MS).unref();

  res.status(201).json({ id });
};
