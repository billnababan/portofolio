import { pool, selectOne } from "../../db/pool.js";
import { HttpError } from "../../lib/errors.js";
import { formatBytes } from "../../lib/text.js";
import { listCertifications } from "../certifications/certifications.queries.js";
import { findMediaByIds, type MediaRow } from "../media/media.queries.js";
import { docFile, makeOgImage, ogFile } from "../media/media.storage.js";
import { listProjects, loadChildren } from "../projects/projects.queries.js";
import { getAllSettings } from "../settings/settings.queries.js";
import { listGroups } from "../skills/skills.queries.js";

// The newest change across all content, used for the sitemap's <lastmod>.
const contentUpdatedAt = async () => {
  const row = await selectOne<{ updated_at: Date }>(
    pool,
    `SELECT MAX(t) AS updated_at FROM (
        SELECT MAX(updated_at) AS t FROM settings
        UNION ALL SELECT MAX(updated_at) FROM projects WHERE status = 'published'
        UNION ALL SELECT MAX(updated_at) FROM certifications WHERE status = 'published'
        UNION ALL SELECT MAX(updated_at) FROM skill_groups
        UNION ALL SELECT MAX(updated_at) FROM media
     ) x`,
  );
  return row?.updated_at ?? new Date();
};

// Exactly the files the static site reads (src/content/*.json and src/data/images.json),
// built from what is marked to show on the site. Drafts never leave the server.
export const buildPublicContent = async () => {
  const s = await getAllSettings(pool);
  const [projects, certs, groups, updatedAt] = await Promise.all([listProjects(pool, true), listCertifications(pool, true), listGroups(pool), contentUpdatedAt()]);
  const children = await loadChildren(pool, projects.map((p) => p.id));

  const imageIds = [s.hero.imageId, ...projects.map((p) => p.image_id), ...certs.map((c) => c.image_id)];
  const media = new Map((await findMediaByIds(pool, [...new Set([...imageIds, s.profile.cvMediaId, s.seo.ogImageId])])).map((m) => [m.id, m]));
  const need = (id: number, what: string): MediaRow => {
    const m = media.get(id);
    if (!m) throw new HttpError(409, `${what} points to a file that no longer exists.`);
    return m;
  };

  const hero = need(s.hero.imageId, "The hero portrait");
  const cv = need(s.profile.cvMediaId, "The CV");
  const og = need(s.seo.ogImageId, "The share image");
  await makeOgImage(og.name, og.version, og.ext);

  const images: Record<string, { width: number; height: number; widths: number[]; formats: string[]; v: string }> = {};
  for (const id of imageIds) {
    const m = need(id, "An image");
    images[m.name] = { width: m.width!, height: m.height!, widths: m.widths!, formats: m.formats!, v: m.version };
  }

  return {
    site: {
      person: {
        name: s.profile.name,
        shortName: s.profile.shortName,
        role: s.profile.role,
        location: s.profile.location,
        availability: s.profile.availability,
        email: s.profile.email,
        phone: { display: s.profile.phoneDisplay, href: s.profile.phoneHref },
        cv: { href: `/images/CV_${s.profile.shortName.replace(/\s+/g, "")}.pdf`, size: formatBytes(cv.bytes) },
        timezone: s.profile.timezone,
      },
      social: s.social,
      hero: { image: hero.name, imageAlt: s.hero.imageAlt, taglineTop: s.hero.taglineTop, taglineBottom: s.hero.taglineBottom },
      marquee: s.marquee,
      story: s.story,
      work: { title: s.sections.workTitle, note: s.sections.workNote, moreTitle: s.sections.moreTitle, moreNote: s.sections.moreNote },
      skills: { title: s.sections.skillsTitle, note: s.sections.skillsNote },
      certifications: { title: s.sections.certificationsTitle, note: s.sections.certificationsNote },
      contact: s.contact,
    },
    projects: projects.map((p) => ({
      id: p.slug,
      featured: p.featured === 1,
      title: p.title,
      short: p.short_title,
      kicker: p.kicker,
      summary: p.summary,
      note: p.note,
      role: p.role,
      image: p.image_name,
      alt: p.image_alt,
      sourceUrl: p.source_url,
      liveUrl: p.live_url,
      ...children.get(p.id)!,
    })),
    skills: groups.map((g) => ({ title: g.title, sub: g.subtitle, items: g.items })),
    certifications: certs.map((c) => ({
      id: c.slug,
      title: c.title,
      issuer: c.issuer,
      year: String(c.year),
      date: c.date_label,
      image: c.image_name,
      alt: c.image_alt,
      link: { href: c.link_url, label: c.link_label },
    })),
    seo: {
      siteUrl: s.seo.siteUrl,
      title: s.seo.title,
      description: s.seo.description,
      keywords: s.seo.keywords,
      ogImage: "/og.jpg",
      ogImageAlt: s.seo.ogImageAlt,
      robotsIndex: s.seo.robotsIndex,
      googleVerification: s.seo.googleVerification,
      jobTitle: s.seo.jobTitle,
      alumniOf: s.seo.alumniOf,
      knowsAbout: s.seo.knowsAbout,
      updatedAt,
    },
    images,
    files: {
      cv: `/media/files/${docFile(cv.name, cv.version, cv.ext)}`,
      og: `/media/${ogFile(og.name, og.version)}`,
    },
  };
};
