import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState, ErrorBlock, PageHeader, Spinner, StatusPill } from "../components/ui/Bits";
import { useFeedback } from "../components/ui/Feedback";
import { Switch, TextField } from "../components/ui/Form";
import { Icon } from "../components/ui/Icon";
import { MoveButtons, move } from "../components/ui/Lists";
import { MediaField } from "../components/ui/MediaPicker";
import { Modal } from "../components/ui/Modal";
import { api, ApiError } from "../lib/api";
import { slugify } from "../lib/format";
import type { Certification } from "../lib/types";

type Input = Omit<Certification, "id" | "imageUrl" | "sortOrder" | "updatedAt">;
const EMPTY: Input = { slug: "", title: "", issuer: "", year: new Date().getFullYear(), dateLabel: "", imageId: 0, imageAlt: "", linkUrl: "", linkLabel: "", status: "published" };

export function Certifications() {
  const q = useQuery({ queryKey: ["certifications"], queryFn: () => api.get<{ certifications: Certification[] }>("/certifications"), select: (d) => d.certifications });
  const qc = useQueryClient();
  const { toast, confirm } = useFeedback();
  const [editing, setEditing] = useState<Certification | "new" | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["certifications"] });
    qc.invalidateQueries({ queryKey: ["publish"] });
  };
  const reorder = useMutation({ mutationFn: (ids: number[]) => api.put("/certifications/order", { ids }), onSuccess: refresh, onError: (e) => toast(e.message, "error") });
  const toggle = useMutation({
    mutationFn: (c: Certification) => api.patch(`/certifications/${c.id}/status`, { status: c.status === "published" ? "draft" : "published" }),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: (c: Certification) => api.delete(`/certifications/${c.id}`), onSuccess: (_d, c) => (toast(`Deleted ${c.title}`), refresh()) });
  const list = q.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="content"
        title="Certifications"
        description="Listed by date with the certificate image. A verify link lets people check it at the issuer."
        actions={
          <button type="button" className="btn-primary" onClick={() => setEditing("new")}>
            <Icon name="plus" size={15} />
            <span>Add certification</span>
          </button>
        }
      />
      {q.isPending && <Spinner />}
      {q.isError && <ErrorBlock error={q.error} retry={() => q.refetch()} />}
      {q.data && list.length === 0 && (
        <div className="card">
          <EmptyState icon="award" title="No certifications yet" body="Add one with its image and, if there is one, a link to verify it." />
        </div>
      )}
      {list.length > 0 && (
        <ul className="card overflow-hidden">
          {list.map((c, i) => (
            <li key={c.id} className="flex flex-wrap items-center gap-5 border-b border-line px-5 py-4 last:border-b-0 md:flex-nowrap">
              <span className="display num w-20 shrink-0 text-[34px] text-transparent [-webkit-text-stroke:1px_rgb(var(--fg))]">{c.year}</span>
              <img src={c.imageUrl} alt="" className="h-14 w-20 shrink-0 rounded-lg border border-line bg-fg object-contain p-1" />
              <div className="min-w-0 flex-1">
                <button type="button" onClick={() => setEditing(c)} className="ul text-left text-[15px] font-semibold">
                  {c.title}
                </button>
                <p className="mt-0.5 truncate text-[13px] text-mute">
                  {c.issuer} · {c.dateLabel}
                </p>
              </div>
              {c.linkUrl && (
                <a href={c.linkUrl} target="_blank" rel="noopener noreferrer" className="meta ul hidden shrink-0 lg:inline">
                  {c.linkLabel} ↗
                </a>
              )}
              <button type="button" onClick={() => toggle.mutate(c)} title={c.status === "published" ? "Hide from the site" : "Show on the site"}>
                <StatusPill status={c.status} />
              </button>
              <span className="flex shrink-0 gap-1">
                <MoveButtons index={i} length={list.length} label={c.title} onMove={(to) => reorder.mutate(move(list, i, to).map((x) => x.id))} />
                <button type="button" className="icon-btn h-8 w-8" aria-label={`Edit ${c.title}`} onClick={() => setEditing(c)}>
                  <Icon name="edit" size={13} />
                </button>
                <button
                  type="button"
                  className="icon-btn h-8 w-8 hover:!border-bad hover:!text-bad"
                  aria-label={`Delete ${c.title}`}
                  onClick={async () => {
                    if (await confirm({ title: `Delete “${c.title}”?`, body: "The certificate image stays in Media.", action: "Delete", danger: true })) remove.mutate(c);
                  }}
                >
                  <Icon name="trash" size={13} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {editing !== null && <CertificationSheet cert={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={refresh} />}
    </>
  );
}

function CertificationSheet({ cert, onClose, onSaved }: { cert: Certification | null; onClose: () => void; onSaved: () => void }) {
  const initial: Input = cert ? { slug: cert.slug, title: cert.title, issuer: cert.issuer, year: cert.year, dateLabel: cert.dateLabel, imageId: cert.imageId, imageAlt: cert.imageAlt, linkUrl: cert.linkUrl, linkLabel: cert.linkLabel, status: cert.status } : EMPTY;
  const [d, setD] = useState<Input>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast, confirm } = useFeedback();
  const set = (patch: Partial<Input>) => setD((x) => ({ ...x, ...patch }));
  const dirty = JSON.stringify(d) !== JSON.stringify(initial);

  const save = useMutation({
    mutationFn: (input: Input) => (cert ? api.put(`/certifications/${cert.id}`, input) : api.post("/certifications", { ...input, slug: input.slug || slugify(input.title) })),
    onSuccess: () => {
      toast(cert ? "Saved" : "Certification added");
      onSaved();
      onClose();
    },
    onError: (e) => {
      setErrors(e instanceof ApiError ? e.fields : {});
      toast(e.message, "error");
    },
  });

  const close = async () => {
    if (!dirty || (await confirm({ title: "Discard changes?", body: "Your edits to this certification have not been saved.", action: "Discard", danger: true }))) onClose();
  };

  return (
    <Modal
      open
      onClose={close}
      title={cert ? "Edit certification" : "Add certification"}
      variant="sheet"
      size="md"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={close}>
            Cancel
          </button>
          <button type="button" className="btn-primary" disabled={save.isPending || (!dirty && cert !== null)} onClick={() => save.mutate(d)}>
            <span>{save.isPending ? "Saving…" : "Save"}</span>
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <TextField label="Title" value={d.title} onChange={(v) => set({ title: v })} error={errors.title} max={200} />
        <TextField label="Issuer" value={d.issuer} onChange={(v) => set({ issuer: v })} error={errors.issuer} max={200} />
        <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4">
          <TextField label="Year" type="number" value={String(d.year)} onChange={(v) => set({ year: Number(v) })} error={errors.year} />
          <TextField label="Date as printed" value={d.dateLabel} onChange={(v) => set({ dateLabel: v })} error={errors.dateLabel} placeholder="October 2024" max={60} />
        </div>
        <MediaField label="Certificate image" value={d.imageId || null} onChange={(imageId) => set({ imageId })} error={errors.imageId} />
        <TextField label="Alt text" multiline rows={2} value={d.imageAlt} onChange={(v) => set({ imageAlt: v })} error={errors.imageAlt} max={300} help="What the certificate says, e.g. who it is for and the qualification." />
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <TextField label="Verify link" mono value={d.linkUrl} onChange={(v) => set({ linkUrl: v })} error={errors.linkUrl} placeholder="https://…" />
          <TextField label="Link label" value={d.linkLabel} onChange={(v) => set({ linkLabel: v })} error={errors.linkLabel} placeholder="Verify on Credly" />
        </div>
        {!cert && <TextField label="Address" mono value={d.slug || slugify(d.title)} onChange={(v) => set({ slug: v })} error={errors.slug} />}
        <Switch label="Show on the site" checked={d.status === "published"} onChange={(v) => set({ status: v ? "published" : "draft" })} />
      </div>
    </Modal>
  );
}
