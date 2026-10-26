import "dotenv/config";
import path from "node:path";
import { z } from "zod";

// Every setting the server reads, checked once at startup. A missing or malformed
// value stops the process with a clear message instead of failing later.
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  // Public address of the portfolio (audited by the SEO module, used for referrer filtering).
  SITE_URL: z.url(),
  // How many proxies sit in front of this server (nginx = 1). Needed for correct client IPs.
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(14),
  STORAGE_DIR: z.string().default("./storage"),
  CMS_DIST: z.string().default("../cms/dist"),

  // Optional integrations. Each feature reports "not configured" in the CMS when its value is empty.
  VERCEL_DEPLOY_HOOK_URL: z.string().default(""),
  GSC_CLIENT_EMAIL: z.string().default(""),
  GSC_PRIVATE_KEY: z.string().default(""),
  GSC_PROPERTY: z.string().default(""),
  SMTP_URL: z.string().default(""),
  NOTIFY_EMAIL: z.string().default(""),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment:\n" + parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n"));
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  storageDir: path.resolve(parsed.data.STORAGE_DIR),
  cmsDist: path.resolve(parsed.data.CMS_DIST),
  siteUrl: parsed.data.SITE_URL.replace(/\/$/, ""),
  gscPrivateKey: parsed.data.GSC_PRIVATE_KEY.replace(/\\n/g, "\n"),
};

export const integrations = {
  publish: env.VERCEL_DEPLOY_HOOK_URL !== "",
  searchConsole: env.GSC_CLIENT_EMAIL !== "" && env.GSC_PRIVATE_KEY !== "" && env.GSC_PROPERTY !== "",
  email: env.SMTP_URL !== "" && env.NOTIFY_EMAIL !== "",
};
