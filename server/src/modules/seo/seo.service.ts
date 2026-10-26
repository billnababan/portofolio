import { pool } from "../../db/pool.js";
import { conflict } from "../../lib/errors.js";
import { getSetting } from "../settings/settings.queries.js";
import { runAudit } from "./seo.audit.js";
import { insertAudit, upsertSearchRows, type AuditRow } from "./seo.queries.js";
import { fetchSearchRows } from "./seo.searchConsole.js";

let auditRunning = false;

// Audits the address set in SEO settings and stores the result.
export const auditAndStore = async (trigger: AuditRow["trigger_type"], userId: number | null) => {
  if (auditRunning) throw conflict("An audit is already running. Wait a few seconds.");
  auditRunning = true;
  try {
    const seo = await getSetting(pool, "seo");
    const result = await runAudit(seo.siteUrl);
    return await insertAudit(pool, { ...result, trigger, userId });
  } finally {
    auditRunning = false;
  }
};

export const syncSearchConsole = async () => {
  const rows = await fetchSearchRows();
  await upsertSearchRows(pool, rows);
  return rows.length;
};
