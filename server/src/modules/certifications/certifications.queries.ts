import { execute, select, selectOne, type Db } from "../../db/pool.js";

export type CertificationRow = {
  id: number;
  slug: string;
  title: string;
  issuer: string;
  year: number;
  date_label: string;
  image_id: number;
  image_alt: string;
  link_url: string;
  link_label: string;
  status: "draft" | "published";
  sort_order: number;
  updated_at: Date;
  image_name: string;
  image_version: string;
  image_widths: number[];
};

export type CertificationInput = {
  slug: string;
  title: string;
  issuer: string;
  year: number;
  dateLabel: string;
  imageId: number;
  imageAlt: string;
  linkUrl: string;
  linkLabel: string;
  status: "draft" | "published";
};

const COLUMNS = `c.id, c.slug, c.title, c.issuer, c.year, c.date_label, c.image_id, c.image_alt, c.link_url, c.link_label, c.status,
                 c.sort_order, c.updated_at, m.name AS image_name, m.version AS image_version, m.widths AS image_widths`;

export const listCertifications = (db: Db, onlyPublished = false) =>
  select<CertificationRow>(
    db,
    `SELECT ${COLUMNS} FROM certifications c JOIN media m ON m.id = c.image_id
     ${onlyPublished ? "WHERE c.status = 'published'" : ""}
     ORDER BY c.sort_order, c.id`,
  );

export const findCertification = (db: Db, id: number) =>
  selectOne<CertificationRow>(db, `SELECT ${COLUMNS} FROM certifications c JOIN media m ON m.id = c.image_id WHERE c.id = ?`, [id]);

const values = (c: CertificationInput) => [c.slug, c.title, c.issuer, c.year, c.dateLabel, c.imageId, c.imageAlt, c.linkUrl, c.linkLabel, c.status];

export const insertCertification = async (db: Db, c: CertificationInput) => {
  const result = await execute(
    db,
    `INSERT INTO certifications (slug, title, issuer, year, date_label, image_id, image_alt, link_url, link_label, status, sort_order)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(MAX(sort_order), 0) + 1 FROM certifications`,
    values(c),
  );
  return result.insertId;
};

export const updateCertification = (db: Db, id: number, c: CertificationInput) =>
  execute(
    db,
    `UPDATE certifications
        SET slug = ?, title = ?, issuer = ?, year = ?, date_label = ?, image_id = ?, image_alt = ?, link_url = ?, link_label = ?, status = ?
      WHERE id = ?`,
    [...values(c), id],
  );

export const setCertificationStatus = (db: Db, id: number, status: "draft" | "published") =>
  execute(db, `UPDATE certifications SET status = ? WHERE id = ?`, [status, id]);

export const deleteCertification = (db: Db, id: number) => execute(db, `DELETE FROM certifications WHERE id = ?`, [id]);

export const reorderCertifications = async (db: Db, ids: number[]) => {
  for (const [i, id] of ids.entries()) await execute(db, `UPDATE certifications SET sort_order = ? WHERE id = ?`, [i + 1, id]);
};
