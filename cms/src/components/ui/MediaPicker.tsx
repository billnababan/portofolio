import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { bytes } from "../../lib/format";
import type { Media } from "../../lib/types";
import { useFeedback } from "./Feedback";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

export const useMedia = () => useQuery({ queryKey: ["media"], queryFn: () => api.get<{ media: Media[] }>("/media"), select: (d) => d.media });

export function useUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, name, alt }: { file: File; name?: string; alt?: string }) => {
      const form = new FormData();
      form.append("file", file);
      if (name) form.append("name", name);
      if (alt) form.append("alt", alt);
      return api.post<{ media: Media }>("/media", form);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media"] }),
  });
}

// Shows the chosen file with Change/Choose; the picker lists the library and can upload.
export function MediaField({ label, value, onChange, kind = "image", help, error }: { label: string; value: number | null; onChange: (id: number, media: Media) => void; kind?: "image" | "file"; help?: string; error?: string }) {
  const { data: media } = useMedia();
  const [open, setOpen] = useState(false);
  const current = media?.find((m) => m.id === value);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold">{label}</span>
      <div className={`flex items-center gap-4 rounded-xl border p-3 ${error ? "border-bad/70" : "border-line"}`}>
        {current ? (
          current.kind === "image" ? (
            <img src={current.url} alt="" className="h-16 w-24 shrink-0 rounded-lg border border-line bg-raised object-contain" />
          ) : (
            <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-line bg-raised text-mute">
              <Icon name="file" size={22} />
            </span>
          )
        ) : (
          <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-line-strong text-faint">
            <Icon name={kind === "image" ? "image" : "file"} size={20} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold">{current ? current.name : "Nothing chosen"}</p>
          {current && <p className="meta truncate">{current.kind === "image" ? `${current.width}×${current.height}` : current.originalName} · {bytes(current.bytes)}</p>}
        </div>
        <button type="button" className="btn" onClick={() => setOpen(true)}>
          <span>{current ? "Change" : "Choose"}</span>
        </button>
      </div>
      {help && !error && <p className="text-[12.5px] text-mute">{help}</p>}
      {error && <p className="text-[12.5px] text-bad">{error}</p>}
      <MediaPicker
        open={open}
        kind={kind}
        selected={value}
        onClose={() => setOpen(false)}
        onPick={(m) => {
          onChange(m.id, m);
          setOpen(false);
        }}
      />
    </div>
  );
}

export function MediaPicker({ open, onClose, onPick, kind, selected }: { open: boolean; onClose: () => void; onPick: (m: Media) => void; kind: "image" | "file"; selected: number | null }) {
  const { data: media } = useMedia();
  const upload = useUpload();
  const { toast } = useFeedback();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const list = useMemo(() => (media ?? []).filter((m) => m.kind === kind && m.name.includes(q.toLowerCase().trim())), [media, kind, q]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const { media: m } = await upload.mutateAsync({ file });
      toast(`Uploaded ${m.name}`);
      onPick(m);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={kind === "image" ? "Choose an image" : "Choose a file"} size="lg">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Icon name="seo" size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
          <input className="input pl-10" placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search media" />
        </div>
        <input ref={input} type="file" hidden accept={kind === "image" ? "image/png,image/jpeg,image/webp,image/avif" : "application/pdf"} onChange={(e) => onFile(e.target.files?.[0])} />
        <button type="button" className="btn-primary" onClick={() => input.current?.click()} disabled={upload.isPending}>
          <Icon name="upload" size={15} />
          <span>{upload.isPending ? "Uploading…" : "Upload new"}</span>
        </button>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        {list.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onPick(m)}
              aria-pressed={m.id === selected}
              className={`group flex w-full flex-col gap-2 rounded-xl border p-2 text-left transition-colors ${m.id === selected ? "border-fg" : "border-line hover:border-line-strong"}`}
            >
              {m.kind === "image" ? (
                <img src={m.url} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-lg bg-raised object-contain" />
              ) : (
                <span className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-raised text-mute">
                  <Icon name="file" size={26} />
                </span>
              )}
              <span className="flex items-center justify-between gap-2 px-0.5">
                <span className="truncate text-[13px] font-semibold">{m.name}</span>
                {m.id === selected && <Icon name="check" size={14} />}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="py-10 text-center text-mute">Nothing here yet. Upload one above.</p>}
    </Modal>
  );
}
