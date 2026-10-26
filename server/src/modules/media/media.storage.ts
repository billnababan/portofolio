import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata } from "sharp";
import { env } from "../../config/env.js";
import { badRequest } from "../../lib/errors.js";

// storage/
//   originals/<name>.<version>.<ext>        the uploaded file, kept to rebuild variants later
//   media/<name>-<width>.<version>.<fmt>     responsive images served at /media (immutable)
//   media/<name>-og.<version>.jpg            1200x630 share image, made when chosen in SEO
//   media/files/<name>.<version>.<ext>       documents (the CV)
export const dirs = {
  originals: path.join(env.storageDir, "originals"),
  media: path.join(env.storageDir, "media"),
  files: path.join(env.storageDir, "media", "files"),
};

export const ensureStorage = async () => {
  for (const dir of Object.values(dirs)) await fs.mkdir(dir, { recursive: true });
};

const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};
const FILE_TYPES: Record<string, string> = { "application/pdf": "pdf" };

export const ACCEPTED_TYPES = [...Object.keys(IMAGE_TYPES), ...Object.keys(FILE_TYPES)];

const WIDTHS = [480, 800, 1200];
const FORMATS = ["avif", "webp"] as const;

export type Processed = {
  kind: "image" | "file";
  ext: string;
  bytes: number;
  version: string;
  width: number | null;
  height: number | null;
  hasAlpha: boolean;
  widths: number[] | null;
  formats: string[] | null;
};

const versionOf = (buffer: Buffer) => crypto.createHash("sha1").update(buffer).digest("hex").slice(0, 8);

export const variantFile = (name: string, width: number, version: string, format: string) => `${name}-${width}.${version}.${format}`;
export const ogFile = (name: string, version: string) => `${name}-og.${version}.jpg`;
export const docFile = (name: string, version: string, ext: string) => `${name}.${version}.${ext}`;

// Checks the bytes (not just the declared type), writes the original and every variant.
export const processUpload = async (name: string, mime: string, buffer: Buffer): Promise<Processed> => {
  const version = versionOf(buffer);

  if (FILE_TYPES[mime]) {
    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") throw badRequest("This file is not a valid PDF.");
    const ext = FILE_TYPES[mime];
    await fs.writeFile(path.join(dirs.files, docFile(name, version, ext)), buffer);
    return { kind: "file", ext, bytes: buffer.length, version, width: null, height: null, hasAlpha: false, widths: null, formats: null };
  }

  const ext = IMAGE_TYPES[mime];
  if (!ext) throw badRequest("Upload a PNG, JPEG, WebP, AVIF image or a PDF.");

  let meta: Metadata;
  try {
    meta = await sharp(buffer).metadata();
  } catch {
    throw badRequest("This file could not be read as an image.");
  }
  if (!meta.width || !meta.height) throw badRequest("This image has no size.");
  if (meta.width > 8000 || meta.height > 8000) throw badRequest("Images can be at most 8000 px on each side.");

  const hasAlpha = Boolean(meta.hasAlpha);
  // Standard widths up to the image's own, plus the image's own width when it is smaller
  // than the largest standard one (an 840 px portrait gets 480, 800 and 840).
  const widths = WIDTHS.filter((w) => w <= meta.width!);
  if (meta.width < WIDTHS[WIDTHS.length - 1]! && !widths.includes(meta.width)) widths.push(meta.width);

  await fs.writeFile(path.join(dirs.originals, docFile(name, version, ext)), buffer);
  for (const w of widths) {
    for (const format of FORMATS) {
      let img = sharp(buffer).rotate().resize({ width: w, withoutEnlargement: true });
      if (!hasAlpha) img = img.flatten({ background: "#ffffff" });
      img = format === "avif" ? img.avif({ quality: 50, effort: 4 }) : img.webp({ quality: 76, effort: 5 });
      await img.toFile(path.join(dirs.media, variantFile(name, w, version, format)));
    }
  }

  return { kind: "image", ext, bytes: buffer.length, version, width: meta.width, height: meta.height, hasAlpha, widths, formats: [...FORMATS] };
};

// 1200x630 JPEG for Open Graph / Twitter cards, cropped from the original.
export const makeOgImage = async (name: string, version: string, ext: string) => {
  const target = path.join(dirs.media, ogFile(name, version));
  const exists = await fs.access(target).then(() => true, () => false);
  if (exists) return;
  await sharp(path.join(dirs.originals, docFile(name, version, ext)))
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .flatten({ background: "#000000" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(target);
};

export const removeFiles = async (m: { kind: string; name: string; version: string; ext: string; widths: number[] | null; formats: string[] | null }) => {
  const files =
    m.kind === "file"
      ? [path.join(dirs.files, docFile(m.name, m.version, m.ext))]
      : [
          path.join(dirs.originals, docFile(m.name, m.version, m.ext)),
          path.join(dirs.media, ogFile(m.name, m.version)),
          ...(m.widths ?? []).flatMap((w) => (m.formats ?? []).map((f) => path.join(dirs.media, variantFile(m.name, w, m.version, f)))),
        ];
  await Promise.all(files.map((f) => fs.rm(f, { force: true })));
};
