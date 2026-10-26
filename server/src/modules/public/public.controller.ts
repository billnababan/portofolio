import type { RequestHandler } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { pool } from "../../db/pool.js";
import { notifyNewMessage } from "../../lib/mailer.js";
import { clientIp } from "../../lib/request.js";
import { requiredText } from "../../lib/schema.js";
import { browserOf, deviceOf, isBot, referrerHost, visitorHash } from "../analytics/analytics.collect.js";
import { insertEvent, insertPageView } from "../analytics/analytics.queries.js";
import { insertMessage } from "../messages/messages.queries.js";
import { buildPublicContent } from "./public.content.js";

// Read by the site's build (scripts/pull-content.mjs). Cached briefly; content changes go live on publish anyway.
export const content: RequestHandler = async (_req, res) => {
  res.set("Cache-Control", "public, max-age=30");
  res.json(await buildPublicContent());
};

export const EVENT_NAMES = ["cv_download", "email_click", "phone_click", "project_open", "social_click", "source_click", "contact_submit"] as const;

const path = z.string().max(255).regex(/^\//).default("/");
const trackSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("pageview"), path, referrer: z.string().max(1000).default(""), utmSource: z.string().trim().max(80).default("") }),
  z.object({ type: z.literal("event"), name: z.enum(EVENT_NAMES), label: z.string().trim().max(120).default(""), path }),
]);

const siteHost = new URL(env.siteUrl).hostname;

export const track: RequestHandler = async (req, res) => {
  const ua = req.get("user-agent") ?? "";
  // Bots are answered like everyone else but not counted.
  if (isBot(ua)) return void res.status(204).end();
  const body = trackSchema.parse(req.body);
  const visitor = await visitorHash(pool, clientIp(req), ua);

  if (body.type === "pageview") {
    const country = (req.get("x-vercel-ip-country") ?? req.get("cf-ipcountry") ?? "").toUpperCase();
    await insertPageView(pool, {
      visitor,
      path: body.path,
      referrerHost: referrerHost(body.referrer, siteHost),
      utmSource: body.utmSource.toLowerCase(),
      device: deviceOf(ua),
      browser: browserOf(ua),
      country: /^[A-Z]{2}$/.test(country) ? country : "",
    });
  } else {
    await insertEvent(pool, { visitor, name: body.name, label: body.label, path: body.path });
  }
  res.status(204).end();
};

const contactSchema = z.object({
  name: requiredText(120, "Name"),
  email: z.email("Enter a valid email address.").max(190),
  message: requiredText(5000, "Message"),
  website: z.string().max(200).default(""), // honeypot
  page: path,
});

export const contact: RequestHandler = async (req, res) => {
  const body = contactSchema.parse(req.body);
  // Bots fill the hidden field: answer as if it worked, store nothing.
  if (body.website !== "") return void res.status(201).json({ ok: true });

  const ua = req.get("user-agent") ?? "";
  const id = await insertMessage(pool, {
    name: body.name,
    email: body.email,
    body: body.message,
    sourcePage: body.page,
    visitor: await visitorHash(pool, clientIp(req), ua),
    userAgent: ua,
  });
  notifyNewMessage({ name: body.name, email: body.email, body: body.message });
  res.status(201).json({ ok: true, id });
};
