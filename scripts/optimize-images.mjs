// Builds responsive AVIF/WebP (and JPEG for the hero photo) derivatives of the
// original images in assets-src/images into public/img, and writes the
// intrinsic size of each source to src/data/images.json so <img> tags can
// carry width/height (no layout shift).
//
// File names carry a short hash of the source (e.g. profile-640.1a2b3c4d.avif),
// so /img/* can be served with a one-year immutable cache. Derivatives that no
// longer match any source are deleted.
//
// Runs on `prebuild`. A derivative is skipped when it exists and the source
// hash recorded in the manifest is unchanged, so repeat builds (and fresh
// clones, where file mtimes are meaningless) are fast. `--force` rebuilds all.
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "assets-src/images");
const outDir = path.join(root, "public/img");
const manifestPath = path.join(root, "src/data/images.json");

// name = public file stem; widths = output widths in px
const jobs = [
  { src: "FotoProfil.jpeg", name: "profile", widths: [320, 640, 800], formats: ["avif", "webp", "jpg"] },
  { src: "dashboardkpp.png", name: "project-kpp-reminders", widths: [480, 800, 1200], formats: ["avif", "webp"] },
  { src: "livechattaskweb.png", name: "project-taskflow", widths: [480, 800, 1200], formats: ["avif", "webp"] },
  { src: "trufflePage.png", name: "project-trufflehog", widths: [480, 800, 1200], formats: ["avif", "webp"] },
  { src: "vitemock.png", name: "project-collaboration", widths: [480, 800, 1200], formats: ["avif", "webp"] },
  { src: "nextjs.png", name: "project-nextjs", widths: [480, 800, 1200], formats: ["avif", "webp"] },
  { src: "edepot.png", name: "project-edepot", widths: [480, 800, 1200], formats: ["avif", "webp"] },
  { src: "rhcsa.jpg", name: "cert-rhcsa", widths: [480, 800, 1200], formats: ["avif", "webp"] },
  { src: "JWP.jpg", name: "cert-jwp", widths: [480, 800, 1200], formats: ["avif", "webp"] },
  { src: "sertifmentor.jpg", name: "cert-mentor", widths: [480, 800, 1200], formats: ["avif", "webp"] },
];

const encoders = {
  avif: (img) => img.avif({ quality: 50, effort: 6 }),
  webp: (img) => img.webp({ quality: 74, effort: 6 }),
  jpg: (img) => img.jpeg({ quality: 78, mozjpeg: true }),
};

const force = process.argv.includes("--force");

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

let previous = {};
try {
  previous = JSON.parse(await fs.readFile(manifestPath, "utf8"));
} catch {
  // first run
}

await fs.mkdir(outDir, { recursive: true });
const manifest = {};
const expected = new Set();
let written = 0;

for (const job of jobs) {
  const srcPath = path.join(srcDir, job.src);
  const buffer = await fs.readFile(srcPath);
  const hash = crypto.createHash("sha1").update(buffer).digest("hex");
  const unchanged = !force && previous[job.name]?.hash === hash;
  const meta = await sharp(buffer).metadata();
  const widths = job.widths.filter((w) => w <= meta.width);
  const v = hash.slice(0, 8);
  manifest[job.name] = { width: meta.width, height: meta.height, widths, formats: job.formats, v, hash };

  for (const w of widths) {
    for (const fmt of job.formats) {
      const file = `${job.name}-${w}.${v}.${fmt}`;
      expected.add(file);
      const out = path.join(outDir, file);
      if (unchanged && (await exists(out))) continue;
      const img = sharp(buffer).resize({ width: w, withoutEnlargement: true }).flatten({ background: "#ffffff" });
      await encoders[fmt](img).toFile(out);
      written++;
    }
  }
}

for (const file of await fs.readdir(outDir)) {
  if (!expected.has(file)) await fs.rm(path.join(outDir, file));
}

await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`optimize-images: ${written} file(s) written, manifest -> ${path.relative(root, manifestPath)}`);
