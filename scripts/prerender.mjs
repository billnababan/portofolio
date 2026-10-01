// Build step 3 of 3 (see package.json "build"):
//   1. vite build                 -> dist/ (client bundle + index.html template)
//   2. vite build --ssr ...       -> .ssr/entry-server.js
//   3. this script                -> renders <App/> to HTML inside dist/index.html,
//                                    adds the hero image preload, checks the CSP hash.
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distHtml = path.join(root, "dist/index.html");
const ssrDir = path.join(root, ".ssr");

const { render, heroImageSizes } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
const images = JSON.parse(await fs.readFile(path.join(root, "src/data/images.json"), "utf8"));

let html = await fs.readFile(distHtml, "utf8");
if (!html.includes("<!--app-html-->") || !html.includes("<!--hero-preload-->")) {
  throw new Error("prerender: placeholders missing from dist/index.html");
}

// Same srcset/sizes as the <Picture name="profile"> in Hero.jsx.
const hero = images.profile;
const heroSrcset = hero.widths.map((w) => `/img/profile-${w}.${hero.v}.avif ${w}w`).join(", ");
const heroPreload = `<link rel="preload" as="image" type="image/avif" imagesrcset="${heroSrcset}" imagesizes="${heroImageSizes}" fetchpriority="high" />`;

const appHtml = render();
if (/\sstyle="/.test(appHtml)) {
  throw new Error("prerender: inline style attribute found in rendered HTML (blocked by CSP style-src 'self')");
}

html = html.replace("<!--hero-preload-->", heroPreload).replace("<!--app-html-->", appHtml);

// Every inline <script> (not JSON-LD) must be allowed by hash in vercel.json's CSP.
const vercel = await fs.readFile(path.join(root, "vercel.json"), "utf8");
for (const [, body] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  const hash = `'sha256-${crypto.createHash("sha256").update(body).digest("base64")}'`;
  if (!vercel.includes(hash)) {
    throw new Error(`prerender: inline script hash ${hash} is not in vercel.json Content-Security-Policy`);
  }
}

await fs.writeFile(distHtml, html);
await fs.rm(ssrDir, { recursive: true, force: true });
console.log(`prerender: dist/index.html written (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
