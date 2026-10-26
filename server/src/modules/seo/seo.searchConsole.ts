import crypto from "node:crypto";
import { env, integrations } from "../../config/env.js";
import { badRequest } from "../../lib/errors.js";
import type { SearchRow } from "./seo.queries.js";

// Google Search Console through a service account: add the service account's email
// as a user (Restricted is enough) on the property, then set the GSC_* variables.

const b64url = (data: string | Buffer) => Buffer.from(data).toString("base64url");

const accessToken = async (): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: env.GSC_CLIENT_EMAIL,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signature = crypto.createSign("RSA-SHA256").update(`${header}.${claims}`).sign(env.gscPrivateKey);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${header}.${claims}.${b64url(signature)}` }),
  });
  const data = (await res.json()) as { access_token?: string; error_description?: string };
  if (!res.ok || !data.access_token) throw new Error(`Google sign-in failed: ${data.error_description ?? res.status}`);
  return data.access_token;
};

type ApiRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

const query = async (token: string, body: Record<string, unknown>): Promise<ApiRow[]> => {
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(env.GSC_PROPERTY)}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { rows?: ApiRow[]; error?: { message: string } };
  if (!res.ok) throw new Error(`Search Console: ${data.error?.message ?? res.status}`);
  return data.rows ?? [];
};

// Search data arrives 2–3 days late; this pulls the last 90 complete days each time
// and upserts, so late corrections from Google overwrite older numbers.
export const fetchSearchRows = async (): Promise<SearchRow[]> => {
  if (!integrations.searchConsole) throw badRequest("Search Console is not connected. Set GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY and GSC_PROPERTY.");
  const token = await accessToken();
  const end = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const start = new Date(Date.now() - 91 * 86_400_000).toISOString().slice(0, 10);
  const base = { startDate: start, endDate: end, rowLimit: 25_000, dataState: "final" };

  const [byDate, byQuery, byPage] = await Promise.all([
    query(token, { ...base, dimensions: ["date"] }),
    query(token, { ...base, dimensions: ["date", "query"] }),
    query(token, { ...base, dimensions: ["date", "page"] }),
  ]);

  const map = (rows: ApiRow[], dimension: SearchRow["dimension"]): SearchRow[] =>
    rows.map((r) => ({
      day: r.keys[0]!,
      dimension,
      key: dimension === "date" ? "" : r.keys[1] ?? "",
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    }));

  return [...map(byDate, "date"), ...map(byQuery, "query"), ...map(byPage, "page")];
};
