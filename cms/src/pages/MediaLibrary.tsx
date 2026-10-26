import { useMemo, useRef, useState, type DragEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState, ErrorBlock, PageHeader, Spinner } from "../components/ui/Bits";
import { useFeedback } from "../components/ui/Feedback";
import { Segmented, TextField } from "../components/ui/Form";
import { Icon } from "../components/ui/Icon";
import { useMedia, useUpload } from "../components/ui/MediaPicker";
import { Modal } from "../components/ui/Modal";
import { api } from "../lib/api";
import { bytes, date } from "../lib/format";
import type { Media } from "../lib/types";

const ACCEPT = "image/png,image/jpeg,image/webp,image/avif,application/pdf";

export function MediaLibrary() {
  const q = useMedia();
  const upload = useUpload();
  const { toast } = useFeedback();
  const [kind, setKind] = useState<"all" | "image" | "file">("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Media | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const list = useMemo(() => (q.data ?? []).filter((m) => (kind === "all" || m.kind === kind) && (m.name.includes(search.toLowerCase()) || m.originalName.toLowerCase().includes(search.toLowerCase()))), [q.data, kind, search]);
  const total = q.data?.reduce((s, m) => s + m.bytes, 0) ?? 0;

  const send = async (files: FileList | null) => {
    for (const file of Array.from(files ?? [])) {
      try {
        const { media } = await upload.mutateAsync({ file });
        toast(`Uploaded ${media.name}`);
      } catch (e) {
        toast(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`, "error");
      }
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    send(e.dataTransfer.files);
  };

  return (
    <>
      <PageHeader
        eyebrow="content"
        title="Media"
        description="Screenshots, certificates, the portrait, the share image and the CV. Images are resized to 480, 800 and 1200 px in AVIF and WebP on upload; the site only ever downloads the size it needs."
        actions={
          <>
            <input ref={input} type="file" multiple hidden accept={ACCEPT} onChange={(e) => (send(e.target.files), (e.target.value = ""))} />
            <button type="button" className="btn-primary" onClick={() => input.current?.click()} disabled={upload.isPending}>
              <Icon name="upload" size={15} />
              <span>{upload.isPending ? "Uploading…" : "Upload"}</span>
            </button>
          </>
        }
      />

      <div
        onDragOver={(e) => (e.preventDefault(), setDragging(true))}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mb-5 flex items-center justify-center gap-3 rounded-2xl border border-dashed px-5 py-6 text-[13.5px] transition-colors ${dragging ? "border-fg bg-raised text-fg" : "border-line-strong text-mute"}`}
      >
        <Icon name="upload" size={16} />
        Drop PNG, JPEG, WebP, AVIF or PDF files here — up to 15 MB each.
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          label="Kind"
          value={kind}
          onChange={setKind}
          options={[
            { value: "all", label: "All", count: q.data?.length },
            { value: "image", label: "Images", count: q.data?.filter((m) => m.kind === "image").length },
            { value: "file", label: "Files", count: q.data?.filter((m) => m.kind === "file").length },
          ]}
        />
        <input className="input max-w-xs" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search media" />
        <span className="meta ml-auto">{bytes(total)} of originals</span>
      </div>

      {q.isPending && <Spinner />}
      {q.isError && <ErrorBlock error={q.error} retry={() => q.refetch()} />}
      {q.data && list.length === 0 && <div className="card"><EmptyState icon="image" title="Nothing here" body="Upload a file, or change the filter." /></div>}

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
        {list.map((m) => (
          <li key={m.id}>
            <button type="button" onClick={() => setOpen(m)} className="card group flex w-full flex-col overflow-hidden text-left transition-colors hover:border-line-strong">
              {m.kind === "image" ? (
                <img src={m.url} alt="" loading="lazy" className={`aspect-[4/3] w-full object-contain ${m.hasAlpha ? "bg-raised" : "bg-fg"}`} />
              ) : (
                <span className="flex aspect-[4/3] w-full items-center justify-center bg-raised text-mute">
                  <Icon name="file" size={32} strokeWidth={1.4} />
                </span>
              )}
              <span className="flex flex-col gap-1 border-t border-line p-3">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13.5px] font-semibold">{m.name}</span>
                  {m.uses > 0 ? <span className="chip shrink-0">in use</span> : <span className="meta shrink-0">unused</span>}
                </span>
                <span className="meta truncate">{m.kind === "image" ? `${m.width}×${m.height}` : "pdf"} · {bytes(m.bytes)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && <MediaSheet media={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function MediaSheet({ media, onClose }: { media: Media; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast, confirm } = useFeedback();
  const [alt, setAlt] = useState(media.alt);
  const replaceInput = useRef<HTMLInputElement>(null);
  const usage = useQuery({ queryKey: ["media-usage", media.id], queryFn: () => api.get<{ usage: { type: string; label: string }[] }>(`/media/${media.id}/usage`) });
  const current = qc.getQueryData<{ media: Media[] }>(["media"])?.media.find((m) => m.id === media.id) ?? media;

  const refresh = () => qc.invalidateQueries({ queryKey: ["media"] });
  const saveAlt = useMutation({ mutationFn: () => api.patch(`/media/${media.id}`, { alt }), onSuccess: () => (toast("Alt text saved"), refresh()) });
  const replace = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return api.post<{ media: Media }>(`/media/${media.id}/replace`, form);
    },
    onSuccess: () => {
      toast("Replaced — everything using it shows the new file after publishing");
      refresh();
      qc.invalidateQueries({ queryKey: ["publish"] });
    },
    onError: (e) => toast(e.message, "error"),
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/media/${media.id}`),
    onSuccess: () => (toast(`Deleted ${media.name}`), refresh(), onClose()),
    onError: (e) => toast(e.message, "error"),
  });
  const uses = usage.data?.usage ?? [];

  return (
    <Modal open onClose={onClose} title={current.name} variant="sheet" size="md">
      <div className="flex flex-col gap-6">
        {current.kind === "image" ? (
          <img src={current.url.replace(/-\d+\./, `-${Math.max(...(current.widths ?? [480]))}.`)} alt={current.alt} className={`max-h-[320px] w-full rounded-xl border border-line object-contain ${current.hasAlpha ? "bg-raised" : "bg-fg"}`} />
        ) : (
          <a href={current.url} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 p-4 hover:border-line-strong">
            <Icon name="file" size={22} />
            <span className="flex-1">{current.originalName}</span>
            <Icon name="arrowUpRight" size={14} />
          </a>
        )}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13.5px]">
          <div>
            <dt className="meta">original</dt>
            <dd className="truncate">{current.originalName}</dd>
          </div>
          <div>
            <dt className="meta">size</dt>
            <dd>{bytes(current.bytes)}{current.width ? ` · ${current.width}×${current.height}` : ""}</dd>
          </div>
          {current.widths && (
            <div>
              <dt className="meta">variants</dt>
              <dd className="font-mono text-[12.5px]">{current.widths.join(", ")} px · {current.formats?.join(", ")}</dd>
            </div>
          )}
          <div>
            <dt className="meta">uploaded</dt>
            <dd>
              {date(current.createdAt)}
              {current.createdBy ? ` · ${current.createdBy}` : ""}
            </dd>
          </div>
        </dl>

        <div>
          <p className="mb-2 text-[13px] font-semibold">Used by</p>
          {usage.isPending ? (
            <p className="meta">checking…</p>
          ) : uses.length === 0 ? (
            <p className="text-[13.5px] text-mute">Not used anywhere. Safe to delete.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {uses.map((u) => (
                <li key={u.label} className="chip normal-case">
                  {u.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {current.kind === "image" && (
          <div className="flex flex-col gap-2">
            <TextField label="Default alt text" multiline rows={2} value={alt} onChange={setAlt} max={300} help="Suggested when this image is picked for a project or certificate." />
            <button type="button" className="btn self-start" disabled={alt === current.alt || saveAlt.isPending} onClick={() => saveAlt.mutate()}>
              <span>Save alt text</span>
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-line pt-5">
          <input ref={replaceInput} type="file" hidden accept={current.kind === "image" ? "image/png,image/jpeg,image/webp,image/avif" : "application/pdf"} onChange={(e) => e.target.files?.[0] && replace.mutate(e.target.files[0])} />
          <button type="button" className="btn" onClick={() => replaceInput.current?.click()} disabled={replace.isPending}>
            <Icon name="refresh" size={15} />
            <span>{replace.isPending ? "Replacing…" : "Replace file"}</span>
          </button>
          <button
            type="button"
            className="btn-danger ml-auto"
            disabled={uses.length > 0 || remove.isPending}
            title={uses.length > 0 ? "Remove it from everything that uses it first" : undefined}
            onClick={async () => {
              if (await confirm({ title: `Delete ${current.name}?`, body: "The file and all its sizes are removed from the server.", action: "Delete file", danger: true })) remove.mutate();
            }}
          >
            <Icon name="trash" size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
