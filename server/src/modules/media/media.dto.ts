import { docFile, variantFile } from "./media.storage.js";
import type { MediaRow } from "./media.queries.js";

// URL the CMS shows as a preview: the smallest WebP variant, or the file itself.
export const previewUrl = (m: Pick<MediaRow, "kind" | "name" | "version" | "ext" | "widths">) =>
  m.kind === "file" ? `/media/files/${docFile(m.name, m.version, m.ext)}` : `/media/${variantFile(m.name, Math.min(...(m.widths ?? [0])), m.version, "webp")}`;

export const toMediaDto = (m: MediaRow, uses: number) => ({
  id: m.id,
  name: m.name,
  kind: m.kind,
  originalName: m.original_name,
  mime: m.mime,
  bytes: m.bytes,
  width: m.width,
  height: m.height,
  version: m.version,
  hasAlpha: m.has_alpha === 1,
  widths: m.widths,
  formats: m.formats,
  alt: m.alt,
  url: previewUrl(m),
  uses,
  createdBy: m.created_by_name,
  createdAt: m.created_at,
});
