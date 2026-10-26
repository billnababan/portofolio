import crypto from "node:crypto";
import { execute, selectOne, type Db } from "../../db/pool.js";

// One random salt per UTC day, shared by every server process through the database.
const salts = new Map<string, string>();

const saltFor = async (db: Db, day: string): Promise<string> => {
  const cached = salts.get(day);
  if (cached) return cached;
  await execute(db, `INSERT IGNORE INTO analytics_salts (day, salt) VALUES (?, ?)`, [day, crypto.randomBytes(16).toString("hex")]);
  const row = await selectOne<{ salt: string }>(db, `SELECT salt FROM analytics_salts WHERE day = ?`, [day]);
  salts.clear();
  salts.set(day, row!.salt);
  return row!.salt;
};

// Same person on the same day -> same hash. Next day -> unrelated hash. No cookie needed.
export const visitorHash = async (db: Db, ip: string, userAgent: string): Promise<string> => {
  const day = new Date().toISOString().slice(0, 10);
  const salt = await saltFor(db, day);
  return crypto.createHash("sha256").update(`${salt}|${ip}|${userAgent}`).digest("hex").slice(0, 16);
};

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|axios|node-fetch/i;
export const isBot = (userAgent: string) => userAgent === "" || BOT_RE.test(userAgent);

export const deviceOf = (ua: string): "desktop" | "mobile" | "tablet" => {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "mobile";
  return "desktop";
};

export const browserOf = (ua: string): string => {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/SamsungBrowser/.test(ua)) return "Samsung Internet";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
};

// "https://www.google.com/search?q=…" -> "google.com"; own site and junk -> "" (direct).
export const referrerHost = (referrer: string, siteHost: string): string => {
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host === siteHost.replace(/^www\./, "") ? "" : host.slice(0, 255);
  } catch {
    return "";
  }
};
