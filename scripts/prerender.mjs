// Build step 3 of 3 (see package.json "build"):
//   1. vite build                 -> dist/ (client bundle + index.html template)
//   2. vite build --ssr ...       -> .ssr/entry-server.js
//   3. this script                -> renders <App/> into dist/index.html, writes the SEO head
//                                    from src/content/seo.json, adds the hero image preload,
//                                    writes robots.txt and sitemap.xml, checks the CSP rules.
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const distHtml = path.join(dist, "index.html");
const ssrDir = path.join(root, ".ssr");

const readJson = async (file) => JSON.parse(await fs.readFile(path.join(root, file), "utf8"));

const { render, heroImageSizes } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
const images = await readJson("src/data/images.json");
const site = await readJson("src/content/site.json");
const seo = await readJson("src/content/seo.json");

let html = await fs.readFile(distHtml, "utf8");
for (const mark of ["<!--app-html-->", "<!--hero-preload-->", "<!--seo-head-->"]) {
  if (!html.includes(mark)) throw new Error(`prerender: ${mark} missing from dist/index.html`);
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const siteUrl = seo.siteUrl.replace(/\/$/, "");
const pageUrl = `${siteUrl}/`;
const ogImage = seo.ogImage.startsWith("http") ? seo.ogImage : `${siteUrl}${seo.ogImage}`;
const [firstName, ...rest] = site.person.name.split(" ");

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${pageUrl}#person`,
      name: site.person.name,
      alternateName: site.person.shortName,
      jobTitle: seo.jobTitle,
      url: pageUrl,
      image: ogImage,
      email: `mailto:${site.person.email}`,
      address: { "@type": "PostalAddress", addressLocality: site.person.location.split(",")[0].trim(), addressCountry: "ID" },
      ...(seo.alumniOf ? { alumniOf: { "@type": "CollegeOrUniversity", name: seo.alumniOf } } : {}),
      knowsAbout: seo.knowsAbout,
      sameAs: site.social.map((s) => s.href),
    },
    {
      "@type": "WebSite",
      "@id": `${pageUrl}#website`,
      url: pageUrl,
      name: site.person.name,
      inLanguage: "en",
      publisher: { "@id": `${pageUrl}#person` },
    },
  ],
};

const seoHead = [
  `<title>${esc(seo.title)}</title>`,
  `<meta name="description" content="${esc(seo.description)}" />`,
  `<link rel="canonical" href="${esc(pageUrl)}" />`,
  `<meta name="robots" content="${seo.robotsIndex ? "index, follow, max-image-preview:large" : "noindex, nofollow"}" />`,
  seo.googleVerification ? `<meta name="google-site-verification" content="${esc(seo.googleVerification)}" />` : "",
  `<meta property="og:type" content="profile" />`,
  `<meta property="og:site_name" content="${esc(site.person.name)}" />`,
  `<meta property="og:title" content="${esc(seo.title)}" />`,
  `<meta property="og:description" content="${esc(seo.description)}" />`,
  `<meta property="og:url" content="${esc(pageUrl)}" />`,
  `<meta property="og:image" content="${esc(ogImage)}" />`,
  `<meta property="og:image:width" content="1200" />`,
  `<meta property="og:image:height" content="630" />`,
  `<meta property="og:image:alt" content="${esc(seo.ogImageAlt)}" />`,
  `<meta property="og:locale" content="en_US" />`,
  `<meta property="profile:first_name" content="${esc(firstName)}" />`,
  `<meta property="profile:last_name" content="${esc(rest.join(" "))}" />`,
  `<meta name="twitter:card" content="summary_large_image" />`,
  `<meta name="twitter:title" content="${esc(seo.title)}" />`,
  `<meta name="twitter:description" content="${esc(seo.description)}" />`,
  `<meta name="twitter:image" content="${esc(ogImage)}" />`,
  `<meta name="twitter:image:alt" content="${esc(seo.ogImageAlt)}" />`,
  `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`,
]
  .filter(Boolean)
  .join("\n    ");

// Same srcset/sizes as the hero <Picture> in Hero.jsx.
const heroName = site.hero.image;
const hero = images[heroName];
const heroSrcset = hero.widths.map((w) => `/img/${heroName}-${w}.${hero.v}.avif ${w}w`).join(", ");
const heroPreload = `<link rel="preload" as="image" type="image/avif" imagesrcset="${heroSrcset}" imagesizes="${heroImageSizes}" fetchpriority="high" />`;

const appHtml = render();
if (/\sstyle="/.test(appHtml)) {
  throw new Error("prerender: inline style attribute found in rendered HTML (blocked by CSP style-src 'self')");
}

html = html.replace("<!--seo-head-->", seoHead).replace("<!--hero-preload-->", heroPreload).replace("<!--app-html-->", appHtml);

// Every inline <script> (not JSON-LD) must be allowed by hash in vercel.json's CSP.
const vercel = await fs.readFile(path.join(root, "vercel.json"), "utf8");
for (const [, body] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  const hash = `'sha256-${crypto.createHash("sha256").update(body).digest("base64")}'`;
  if (!vercel.includes(hash)) {
    throw new Error(`prerender: inline script hash ${hash} is not in vercel.json Content-Security-Policy`);
  }
}

const lastmod = seo.updatedAt.slice(0, 10);
const robots = seo.robotsIndex ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n` : `User-agent: *\nDisallow: /\n`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>
</urlset>
`;

await fs.writeFile(distHtml, html);
await fs.writeFile(path.join(dist, "robots.txt"), robots);
await fs.writeFile(path.join(dist, "sitemap.xml"), sitemap);
await fs.rm(ssrDir, { recursive: true, force: true });
console.log(`prerender: dist/index.html written (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB), robots.txt, sitemap.xml`);
