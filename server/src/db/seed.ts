// First-time setup: creates the owner account and imports the portfolio as it is
// today — the JSON snapshot the site builds from (../src/content) and the original
// images in ./seed/media — into the database.
// Usage: npm run db:seed   (needs SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD in .env)
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { execute, pool, selectOne, withTransaction, type Db } from "./pool.js";
import { insertMedia } from "../modules/media/media.queries.js";
import { ensureStorage, makeOgImage, processUpload } from "../modules/media/media.storage.js";
import { insertProject, replaceChildren, setProjectStatus } from "../modules/projects/projects.queries.js";
import { projectSchema } from "../modules/projects/projects.schema.js";
import { putSetting } from "../modules/settings/settings.queries.js";
import { settingsSchemas } from "../modules/settings/settings.schema.js";
import { insertGroup, replaceItems } from "../modules/skills/skills.queries.js";
import { insertCertification } from "../modules/certifications/certifications.queries.js";
import { logActivity } from "../lib/activity.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, "../..");
const siteContent = path.resolve(serverRoot, "../src/content");
const seedMedia = path.join(serverRoot, "seed/media");

const readJson = async <T>(file: string): Promise<T> => JSON.parse(await fs.readFile(path.join(siteContent, file), "utf8")) as T;

// Media name on the site -> original file in seed/media.
const MEDIA: Record<string, { file: string; mime: string; alt: string }> = {
  portrait: { file: "portrait-cutout.png", mime: "image/png", alt: "Portrait of Bill Jeferson Nababan" },
  "project-edepot": { file: "edepot.png", mime: "image/png", alt: "" },
  "project-kpp-reminders": { file: "dashboardkpp.png", mime: "image/png", alt: "" },
  "project-taskflow": { file: "livechattaskweb.png", mime: "image/png", alt: "" },
  "project-trufflehog": { file: "trufflePage.png", mime: "image/png", alt: "" },
  "project-collaboration": { file: "vitemock.png", mime: "image/png", alt: "" },
  "project-nextjs": { file: "nextjs.png", mime: "image/png", alt: "" },
  "cert-rhcsa": { file: "rhcsa.jpg", mime: "image/jpeg", alt: "" },
  "cert-mentor": { file: "sertifmentor.jpg", mime: "image/jpeg", alt: "" },
  "cert-jwp": { file: "JWP.jpg", mime: "image/jpeg", alt: "" },
  "og-default": { file: "og-default.png", mime: "image/png", alt: "Share card: name, role and portrait" },
  cv: { file: "CV_BillJeferson.pdf", mime: "application/pdf", alt: "" },
};

type SiteJson = {
  person: { name: string; shortName: string; role: string; location: string; availability: string; email: string; phone: { display: string; href: string }; timezone: string };
  social: { label: string; href: string }[];
  hero: { imageAlt: string; taglineTop: string; taglineBottom: string };
  marquee: string[];
  story: { struck: string[]; now: string; lede: string; paragraphs: string[] };
  work: { title: string; note: string; moreTitle: string; moreNote: string };
  skills: { title: string; note: string };
  certifications: { title: string; note: string };
  contact: { eyebrow: string; title: string; lede: string; ledeStrong: string; messageLabel: string };
};
type ProjectJson = {
  id: string; featured: boolean; title: string; short: string; kicker: string; summary: string; note: string; role: string;
  stack: string[]; image: string; alt: string; sourceUrl: string; liveUrl: string;
  stats: { value: string; label: string }[];
  steps: { label: string; text: string; flow: string[]; facts: string[]; features: { title: string; text: string }[] }[];
};
type CertJson = { id: string; title: string; issuer: string; year: string; date: string; image: string; alt: string; link: { href: string; label: string } };
type SkillJson = { title: string; sub: string; items: { name: string; tag: string }[] };
type SeoJson = { siteUrl: string; title: string; description: string; keywords: string[]; ogImageAlt: string; robotsIndex: boolean; googleVerification: string; jobTitle: string; alumniOf: string; knowsAbout: string[] };

const importMedia = async (db: Db, userId: number) => {
  const ids: Record<string, number> = {};
  for (const [name, m] of Object.entries(MEDIA)) {
    const buffer = await fs.readFile(path.join(seedMedia, m.file));
    const p = await processUpload(name, m.mime, buffer);
    ids[name] = await insertMedia(db, { name, kind: p.kind, originalName: m.file, mime: m.mime, ext: p.ext, bytes: p.bytes, width: p.width, height: p.height, version: p.version, hasAlpha: p.hasAlpha, widths: p.widths, formats: p.formats, alt: m.alt, userId });
    if (name === "og-default") await makeOgImage(name, p.version, p.ext);
    console.log(`  media ${name}`);
  }
  return ids;
};

export const seed = async (owner: { name: string; email: string; password: string }) => {
  const existing = await selectOne<{ total: number }>(pool, `SELECT COUNT(*) AS total FROM users`);
  if (Number(existing?.total) > 0) throw new Error("seed: the database already has users. Seeding only runs on an empty database.");

  await ensureStorage();
  const site = await readJson<SiteJson>("site.json");
  const projects = await readJson<ProjectJson[]>("projects.json");
  const certs = await readJson<CertJson[]>("certifications.json");
  const skills = await readJson<SkillJson[]>("skills.json");
  const seo = await readJson<SeoJson>("seo.json");

  await withTransaction(async (db) => {
    const { insertId: userId } = await execute(db, `INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, 'owner', ?)`, [
      owner.name,
      owner.email.toLowerCase(),
      await bcrypt.hash(owner.password, 12),
    ]);

    const media = await importMedia(db, userId);
    const id = (name: string) => {
      const v = media[name];
      if (!v) throw new Error(`seed: no media named ${name}`);
      return v;
    };

    const settings = {
      profile: {
        name: site.person.name,
        shortName: site.person.shortName,
        role: site.person.role,
        location: site.person.location,
        availability: site.person.availability,
        email: site.person.email,
        phoneDisplay: site.person.phone.display,
        phoneHref: site.person.phone.href,
        timezone: site.person.timezone,
        cvMediaId: id("cv"),
      },
      social: site.social,
      hero: { imageId: id("portrait"), imageAlt: site.hero.imageAlt, taglineTop: site.hero.taglineTop, taglineBottom: site.hero.taglineBottom },
      marquee: site.marquee,
      story: site.story,
      sections: {
        workTitle: site.work.title,
        workNote: site.work.note,
        moreTitle: site.work.moreTitle,
        moreNote: site.work.moreNote,
        skillsTitle: site.skills.title,
        skillsNote: site.skills.note,
        certificationsTitle: site.certifications.title,
        certificationsNote: site.certifications.note,
      },
      contact: site.contact,
      seo: { ...seo, ogImageId: id("og-default") },
    };
    for (const [key, value] of Object.entries(settings)) {
      await putSetting(db, key as keyof typeof settingsSchemas, settingsSchemas[key as keyof typeof settingsSchemas].parse(value), userId);
    }

    for (const p of projects) {
      const input = projectSchema.parse({
        slug: p.id,
        title: p.title,
        shortTitle: p.short,
        kicker: p.kicker,
        summary: p.summary,
        note: p.note,
        role: p.role,
        featured: p.featured,
        imageId: id(p.image),
        imageAlt: p.alt,
        sourceUrl: p.sourceUrl,
        liveUrl: p.liveUrl,
        status: "published",
        stack: p.stack,
        stats: p.stats,
        steps: p.steps,
      });
      const projectId = await insertProject(db, input, userId);
      await replaceChildren(db, projectId, input);
      await setProjectStatus(db, projectId, "published", userId);
    }

    for (const s of skills) {
      const groupId = await insertGroup(db, { title: s.title, subtitle: s.sub, items: s.items });
      await replaceItems(db, groupId, s.items);
    }

    for (const c of certs) {
      await insertCertification(db, {
        slug: c.id,
        title: c.title,
        issuer: c.issuer,
        year: Number(c.year),
        dateLabel: c.date,
        imageId: id(c.image),
        imageAlt: c.alt,
        linkUrl: c.link.href,
        linkLabel: c.link.label,
        status: "published",
      });
    }

    await logActivity(db, { userId, action: "seed", summary: "Imported the portfolio into the CMS" });
    // The imported content is what is live today, so start with nothing pending.
    await execute(
      db,
      `INSERT INTO publishes (status, last_activity_id, note, response, triggered_by)
       SELECT 'triggered', MAX(id), 'Initial import', 'seed', ? FROM activity_log`,
      [userId],
    );
  });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const owner = {
    name: process.env.SEED_OWNER_NAME || "Owner",
    email: process.env.SEED_OWNER_EMAIL || "",
    password: process.env.SEED_OWNER_PASSWORD || "",
  };
  if (!owner.email || owner.password.length < 10) {
    console.error("seed: set SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD (10+ characters) in .env");
    process.exit(1);
  }
  await seed(owner);
  console.log(`seed: done. Log in as ${owner.email}.`);
  await pool.end();
}
