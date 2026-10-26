import { parse, type HTMLElement } from "node-html-parser";
import sharp from "sharp";

export type CheckStatus = "pass" | "warn" | "fail";

export type Check = {
  id: string;
  group: "Search appearance" | "Crawling" | "Social sharing" | "Performance" | "Content & accessibility";
  label: string;
  status: CheckStatus;
  value: string;
  advice: string;
  weight: 1 | 2 | 3;
};

export type AuditResult = {
  url: string;
  statusCode: number;
  responseMs: number;
  htmlBytes: number;
  score: number;
  checks: Check[];
};

const UA = "PortfolioCMS-SEO-Audit/1.0 (+self-check of the owner's site)";
const TIMEOUT_MS = 15_000;

const get = async (url: string) => {
  const started = performance.now();
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Encoding": "br, gzip" }, redirect: "follow", signal: AbortSignal.timeout(TIMEOUT_MS) });
  const body = Buffer.from(await res.arrayBuffer());
  return { res, body, ms: Math.round(performance.now() - started) };
};

const meta = (root: HTMLElement, attr: "name" | "property", key: string) =>
  root.querySelector(`meta[${attr}="${key}"]`)?.getAttribute("content")?.trim() ?? "";

// Weighted: pass = full weight, warn = half, fail = nothing.
export const scoreOf = (checks: Check[]) => {
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + (c.status === "pass" ? c.weight : c.status === "warn" ? c.weight / 2 : 0), 0);
  return total === 0 ? 0 : Math.round((got / total) * 100);
};

// Audits the live home page the way a search engine first sees it: the HTML as served.
export const runAudit = async (siteUrl: string): Promise<AuditResult> => {
  const url = `${siteUrl.replace(/\/$/, "")}/`;
  const checks: Check[] = [];
  const add = (c: Check) => checks.push(c);

  let page: Awaited<ReturnType<typeof get>>;
  try {
    page = await get(url);
  } catch (err) {
    add({
      id: "reachable",
      group: "Crawling",
      label: "Site is reachable",
      status: "fail",
      value: err instanceof Error ? err.message : "Request failed",
      advice: "The site did not answer within 15 seconds. Check the deployment and the domain.",
      weight: 3,
    });
    return { url, statusCode: 0, responseMs: TIMEOUT_MS, htmlBytes: 0, score: 0, checks };
  }

  const { res, body, ms } = page;
  const html = body.toString("utf8");
  const root = parse(html);
  const head = root.querySelector("head") ?? root;

  // ── Crawling ─────────────────────────────────────────
  add({
    id: "status",
    group: "Crawling",
    label: "Home page answers 200 OK",
    status: res.status === 200 ? "pass" : "fail",
    value: String(res.status),
    advice: "Search engines only index pages that answer 200.",
    weight: 3,
  });
  add({
    id: "https",
    group: "Crawling",
    label: "Served over HTTPS",
    status: res.url.startsWith("https://") ? "pass" : "fail",
    value: new URL(res.url).protocol.replace(":", ""),
    advice: "Use HTTPS; browsers mark plain HTTP as not secure and rankings favour HTTPS.",
    weight: 2,
  });

  const robotsMeta = meta(head, "name", "robots").toLowerCase();
  add({
    id: "indexable",
    group: "Crawling",
    label: "Page allows indexing",
    status: robotsMeta.includes("noindex") ? "fail" : "pass",
    value: robotsMeta || "no robots meta (indexable)",
    advice: "The robots meta says noindex, so the page will drop out of Google. Turn on “Allow search engines” in SEO settings.",
    weight: 3,
  });

  const canonical = head.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";
  add({
    id: "canonical",
    group: "Crawling",
    label: "Canonical URL",
    status: canonical === "" ? "fail" : canonical === url ? "pass" : "warn",
    value: canonical || "missing",
    advice: canonical === "" ? "Add a canonical link so search engines know the main address of the page." : `It points to ${canonical}, not ${url}. Make the Site URL in SEO settings match the live address.`,
    weight: 3,
  });

  try {
    const robots = await get(`${siteUrl}/robots.txt`);
    const text = robots.body.toString("utf8");
    const blocksAll = /^\s*disallow:\s*\/\s*$/im.test(text);
    const hasSitemap = /^\s*sitemap:/im.test(text);
    add({
      id: "robots_txt",
      group: "Crawling",
      label: "robots.txt",
      status: robots.res.status !== 200 || blocksAll ? "fail" : hasSitemap ? "pass" : "warn",
      value: robots.res.status !== 200 ? `HTTP ${robots.res.status}` : blocksAll ? "blocks the whole site" : hasSitemap ? "found, lists the sitemap" : "found, no Sitemap line",
      advice: blocksAll ? "robots.txt blocks every crawler. Turn on “Allow search engines” and publish." : "robots.txt should exist and point to the sitemap.",
      weight: 3,
    });
  } catch {
    add({ id: "robots_txt", group: "Crawling", label: "robots.txt", status: "fail", value: "not reachable", advice: "robots.txt could not be fetched.", weight: 3 });
  }

  try {
    const sm = await get(`${siteUrl}/sitemap.xml`);
    const text = sm.body.toString("utf8");
    const ok = sm.res.status === 200 && text.includes("<urlset") && text.includes(`<loc>${url}</loc>`);
    add({
      id: "sitemap",
      group: "Crawling",
      label: "sitemap.xml lists the home page",
      status: ok ? "pass" : "fail",
      value: sm.res.status !== 200 ? `HTTP ${sm.res.status}` : ok ? "valid" : "home page missing",
      advice: "The sitemap helps Google find and refresh the page. It is written on every publish.",
      weight: 3,
    });
  } catch {
    add({ id: "sitemap", group: "Crawling", label: "sitemap.xml lists the home page", status: "fail", value: "not reachable", advice: "sitemap.xml could not be fetched.", weight: 3 });
  }

  // ── Search appearance ───────────────────────────────
  const title = head.querySelector("title")?.text.trim() ?? "";
  add({
    id: "title",
    group: "Search appearance",
    label: "Title tag",
    status: title === "" ? "fail" : title.length >= 30 && title.length <= 60 ? "pass" : "warn",
    value: title ? `${title.length} characters` : "missing",
    advice: "Aim for 30–60 characters: Google cuts longer titles in results.",
    weight: 3,
  });

  const description = meta(head, "name", "description");
  add({
    id: "description",
    group: "Search appearance",
    label: "Meta description",
    status: description === "" ? "fail" : description.length >= 70 && description.length <= 160 ? "pass" : "warn",
    value: description ? `${description.length} characters` : "missing",
    advice: "Aim for 70–160 characters. This is the grey text under the title in search results.",
    weight: 3,
  });

  const jsonLdBlocks = head.querySelectorAll('script[type="application/ld+json"]').map((s) => s.text);
  let ldStatus: CheckStatus = jsonLdBlocks.length === 0 ? "warn" : "pass";
  let ldValue = jsonLdBlocks.length === 0 ? "missing" : "Person + WebSite";
  for (const block of jsonLdBlocks) {
    try {
      const data = JSON.parse(block);
      const types = JSON.stringify(data);
      if (!types.includes('"Person"')) {
        ldStatus = "warn";
        ldValue = "no Person entity";
      }
    } catch {
      ldStatus = "fail";
      ldValue = "invalid JSON";
    }
  }
  add({
    id: "structured_data",
    group: "Search appearance",
    label: "Structured data (JSON-LD)",
    status: ldStatus,
    value: ldValue,
    advice: "A Person entity helps Google connect the site with your name and profiles.",
    weight: 2,
  });

  const verification = meta(head, "name", "google-site-verification");
  add({
    id: "gsc_verification",
    group: "Search appearance",
    label: "Google Search Console verification",
    status: verification ? "pass" : "warn",
    value: verification ? "present" : "missing",
    advice: "Add the verification code in SEO settings to see search performance in this dashboard.",
    weight: 1,
  });

  // ── Social sharing ──────────────────────────────────
  const og = { title: meta(head, "property", "og:title"), description: meta(head, "property", "og:description"), image: meta(head, "property", "og:image"), url: meta(head, "property", "og:url") };
  const missingOg = Object.entries(og).filter(([, v]) => v === "").map(([k]) => `og:${k}`);
  add({
    id: "open_graph",
    group: "Social sharing",
    label: "Open Graph tags",
    status: missingOg.length === 0 ? "pass" : missingOg.length === 4 ? "fail" : "warn",
    value: missingOg.length === 0 ? "complete" : `missing ${missingOg.join(", ")}`,
    advice: "These control the card shown when the link is shared on WhatsApp, LinkedIn and others.",
    weight: 2,
  });

  if (og.image) {
    try {
      const img = await get(og.image);
      const m = img.res.ok ? await sharp(img.body).metadata() : null;
      const ratio = m?.width && m.height ? m.width / m.height : 0;
      add({
        id: "og_image",
        group: "Social sharing",
        label: "Share image",
        status: !m ? "fail" : m.width! >= 1200 && Math.abs(ratio - 1.91) < 0.1 ? "pass" : "warn",
        value: m ? `${m.width}×${m.height}` : `HTTP ${img.res.status}`,
        advice: "Use 1200×630 so the card is sharp and not cropped. The CMS makes this size from the image you pick.",
        weight: 2,
      });
    } catch {
      add({ id: "og_image", group: "Social sharing", label: "Share image", status: "fail", value: "not reachable", advice: "The og:image URL could not be fetched.", weight: 2 });
    }
  }

  add({
    id: "twitter_card",
    group: "Social sharing",
    label: "Twitter / X card",
    status: meta(head, "name", "twitter:card") ? "pass" : "warn",
    value: meta(head, "name", "twitter:card") || "missing",
    advice: "summary_large_image shows the share image at full width.",
    weight: 1,
  });

  // ── Performance ─────────────────────────────────────
  add({
    id: "response_time",
    group: "Performance",
    label: "Server response time",
    status: ms < 600 ? "pass" : ms < 1500 ? "warn" : "fail",
    value: `${ms} ms`,
    advice: "Measured from the CMS server, so it includes network distance. Under 600 ms is good.",
    weight: 2,
  });
  add({
    id: "html_size",
    group: "Performance",
    label: "HTML size",
    status: body.length < 100_000 ? "pass" : body.length < 250_000 ? "warn" : "fail",
    value: `${Math.round(body.length / 1024)} KB`,
    advice: "Smaller HTML reaches the first paint sooner.",
    weight: 1,
  });
  const encoding = res.headers.get("content-encoding") ?? "";
  add({
    id: "compression",
    group: "Performance",
    label: "Compression",
    status: /br|gzip|zstd/.test(encoding) ? "pass" : "warn",
    value: encoding || "none",
    advice: "Vercel compresses automatically; if this fails, check a proxy in front of the site.",
    weight: 1,
  });

  // ── Content & accessibility ─────────────────────────
  const h1s = root.querySelectorAll("h1");
  add({
    id: "h1",
    group: "Content & accessibility",
    label: "One H1 heading",
    status: h1s.length === 1 ? "pass" : h1s.length === 0 ? "fail" : "warn",
    value: `${h1s.length} found`,
    advice: "One H1 tells search engines what the page is about.",
    weight: 3,
  });

  const levels = root.querySelectorAll("h1, h2, h3, h4, h5, h6").map((h) => Number(h.tagName.slice(1)));
  const skips = levels.filter((l, i) => i > 0 && l > (levels[i - 1] ?? 1) + 1).length;
  add({
    id: "heading_order",
    group: "Content & accessibility",
    label: "Heading levels in order",
    status: skips === 0 ? "pass" : "warn",
    value: skips === 0 ? "no skipped levels" : `${skips} skipped level(s)`,
    advice: "Skipping levels (H2 straight to H4) makes the outline harder for screen readers.",
    weight: 1,
  });

  const imgs = root.querySelectorAll("img");
  const noAlt = imgs.filter((i) => i.getAttribute("alt") === undefined).length;
  add({
    id: "img_alt",
    group: "Content & accessibility",
    label: "Images have alt text",
    status: noAlt === 0 ? "pass" : "fail",
    value: `${imgs.length - noAlt} of ${imgs.length}`,
    advice: "Alt text describes images to screen readers and to Google Images. Edit it on each project and certificate.",
    weight: 2,
  });
  const noSize = imgs.filter((i) => !i.getAttribute("width") || !i.getAttribute("height")).length;
  add({
    id: "img_size",
    group: "Content & accessibility",
    label: "Images have width and height",
    status: noSize === 0 ? "pass" : "warn",
    value: noSize === 0 ? "all sized" : `${noSize} without size`,
    advice: "Sizes reserve space so the layout does not jump while images load (CLS).",
    weight: 1,
  });

  const blankLinks = root.querySelectorAll('a[target="_blank"]');
  const unsafe = blankLinks.filter((a) => !/noopener|noreferrer/.test(a.getAttribute("rel") ?? "")).length;
  add({
    id: "external_links",
    group: "Content & accessibility",
    label: "New-tab links use rel=noopener",
    status: unsafe === 0 ? "pass" : "warn",
    value: unsafe === 0 ? `${blankLinks.length} checked` : `${unsafe} without noopener`,
    advice: "noopener stops the opened page from controlling yours.",
    weight: 1,
  });

  add({
    id: "lang",
    group: "Content & accessibility",
    label: "Language declared",
    status: root.querySelector("html")?.getAttribute("lang") ? "pass" : "warn",
    value: root.querySelector("html")?.getAttribute("lang") ?? "missing",
    advice: "The lang attribute tells browsers and search engines the page language.",
    weight: 1,
  });

  add({
    id: "viewport",
    group: "Content & accessibility",
    label: "Mobile viewport",
    status: meta(head, "name", "viewport").includes("width=device-width") ? "pass" : "fail",
    value: meta(head, "name", "viewport") || "missing",
    advice: "Without it, phones show a zoomed-out desktop page and Google marks it not mobile-friendly.",
    weight: 3,
  });

  const words = (root.querySelector("main") ?? root).text.split(/\s+/).filter((w) => /[a-z]/i.test(w)).length;
  add({
    id: "word_count",
    group: "Content & accessibility",
    label: "Enough text to rank",
    status: words >= 300 ? "pass" : "warn",
    value: `${words} words`,
    advice: "Pages with very little text rarely rank. The case studies are the best place to add more.",
    weight: 1,
  });

  add({
    id: "favicon",
    group: "Content & accessibility",
    label: "Favicon",
    status: head.querySelector('link[rel~="icon"]') ? "pass" : "warn",
    value: head.querySelector('link[rel~="icon"]') ? "present" : "missing",
    advice: "Google shows the favicon next to the result on mobile.",
    weight: 1,
  });

  return { url, statusCode: res.status, responseMs: ms, htmlBytes: body.length, score: scoreOf(checks), checks };
};
