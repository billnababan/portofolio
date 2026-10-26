// Pulls the published content from the CMS into the snapshot the build reads:
//   src/content/{site,projects,skills,certifications,seo}.json
//   src/data/images.json + public/img/*   (responsive images, made by the CMS on upload)
//   public/images/CV_<name>.pdf, public/og.jpg
// The site stays fully static: nothing is fetched from the CMS at runtime.
//
// Usage: CMS_API_URL=https://cms.your-domain.com npm run content:pull
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const api = (process.env.CMS_API_URL || "").replace(/\/$/, "");
if (!api) throw new Error("content:pull: set CMS_API_URL, e.g. CMS_API_URL=https://cms.your-domain.com");

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`content:pull: GET ${url} -> ${res.status}`);
  return res;
}

async function download(url, file) {
  const res = await get(url);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
}

const content = await (await get(`${api}/api/public/content`)).json();

const writeJson = (file, data) => fs.writeFile(path.join(root, file), JSON.stringify(data, null, 2) + "\n");
await writeJson("src/content/site.json", content.site);
await writeJson("src/content/projects.json", content.projects);
await writeJson("src/content/skills.json", content.skills);
await writeJson("src/content/certifications.json", content.certifications);
await writeJson("src/content/seo.json", content.seo);
await writeJson("src/data/images.json", content.images);

// Responsive images: download what is missing, delete what is no longer used.
const imgDir = path.join(root, "public/img");
await fs.mkdir(imgDir, { recursive: true });
const expected = new Set();
let downloaded = 0;
for (const [name, meta] of Object.entries(content.images)) {
  for (const w of meta.widths) {
    for (const fmt of meta.formats) {
      const file = `${name}-${w}.${meta.v}.${fmt}`;
      expected.add(file);
      const target = path.join(imgDir, file);
      const exists = await fs.access(target).then(
        () => true,
        () => false,
      );
      if (exists) continue; // names carry a content hash, so an existing file is already current
      await download(`${api}/media/${file}`, target);
      downloaded++;
    }
  }
}
for (const file of await fs.readdir(imgDir)) {
  if (!expected.has(file)) await fs.rm(path.join(imgDir, file));
}

await download(`${api}${content.files.cv}`, path.join(root, "public", content.site.person.cv.href));
await download(`${api}${content.files.og}`, path.join(root, "public", content.seo.ogImage));

console.log(`content:pull: content written, ${downloaded} image file(s) downloaded, ${expected.size} in use`);
