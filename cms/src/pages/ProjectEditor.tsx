import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorBlock, Spinner } from "../components/ui/Bits";
import { useFeedback } from "../components/ui/Feedback";
import { Switch, TextField } from "../components/ui/Form";
import { Icon } from "../components/ui/Icon";
import { ChipsInput, MoveButtons, StringList, move } from "../components/ui/Lists";
import { MediaField } from "../components/ui/MediaPicker";
import { useUnsaved } from "../hooks/useUnsaved";
import { api, ApiError } from "../lib/api";
import { slugify } from "../lib/format";
import type { Project, ProjectInput, Step } from "../lib/types";

const EMPTY: ProjectInput = {
  slug: "",
  title: "",
  shortTitle: "",
  kicker: "",
  summary: "",
  note: "",
  role: "",
  featured: false,
  imageId: 0,
  imageAlt: "",
  sourceUrl: "",
  liveUrl: "",
  status: "draft",
  stack: [],
  stats: [],
  steps: [],
};

const toInput = (p: Project): ProjectInput => ({
  slug: p.slug,
  title: p.title,
  shortTitle: p.shortTitle,
  kicker: p.kicker,
  summary: p.summary,
  note: p.note,
  role: p.role,
  featured: p.featured,
  imageId: p.imageId,
  imageAlt: p.imageAlt,
  sourceUrl: p.sourceUrl,
  liveUrl: p.liveUrl,
  status: p.status,
  stack: p.stack,
  stats: p.stats,
  steps: p.steps,
});

const STEP_PRESETS = ["the problem", "what i built", "what changed"];

function Block({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="text-[16px] font-semibold tracking-[-0.01em]">{title}</h2>
      {description && <p className="mt-1 text-[13.5px] leading-relaxed text-mute">{description}</p>}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

export function ProjectEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const q = useQuery({ queryKey: ["project", id], queryFn: () => api.get<{ project: Project }>(`/projects/${id}`), enabled: !isNew });

  if (!isNew && q.isPending) return <Spinner />;
  if (!isNew && q.isError) return <ErrorBlock error={q.error} retry={() => q.refetch()} />;
  return <Editor key={id} initial={isNew ? EMPTY : toInput(q.data!.project)} id={isNew ? null : Number(id)} />;
}

function Editor({ initial, id }: { initial: ProjectInput; id: number | null }) {
  const [p, setP] = useState<ProjectInput>(initial);
  const [saved, setSaved] = useState<ProjectInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(id !== null);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const dirty = JSON.stringify(p) !== JSON.stringify(saved);
  useUnsaved(dirty);

  const set = (patch: Partial<ProjectInput>) => setP((x) => ({ ...x, ...patch }));
  const setStep = (i: number, patch: Partial<Step>) => set({ steps: p.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  // The slug follows the title until it is edited by hand.
  useEffect(() => {
    if (!slugTouched) setP((x) => ({ ...x, slug: slugify(x.title) }));
  }, [p.title, slugTouched]);

  const save = useMutation({
    mutationFn: (input: ProjectInput) => (id === null ? api.post<{ project: Project }>("/projects", input) : api.put<{ project: Project }>(`/projects/${id}`, input)),
    onSuccess: ({ project }) => {
      setErrors({});
      const next = toInput(project);
      setP(next);
      setSaved(next);
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["publish"] });
      qc.setQueryData(["project", String(project.id)], { project });
      toast(project.status === "published" ? "Saved — publish to update the site" : "Saved as hidden");
      // After the saved state has rendered (so the unsaved-changes guard sees a clean form).
      if (id === null) setTimeout(() => navigate(`/content/projects/${project.id}`, { replace: true }));
    },
    onError: (e) => {
      setErrors(e instanceof ApiError ? e.fields : {});
      toast(e instanceof ApiError && Object.keys(e.fields).length ? `${Object.keys(e.fields).length} field(s) need attention` : e.message, "error");
    },
  });

  const err = (k: string) => errors[k];
  const stepErrors = (i: number) => Object.entries(errors).filter(([k]) => k.startsWith(`steps.${i}.`));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(p);
      }}
      noValidate
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link to="/content/projects" className="btn-ghost -ml-3 mb-3">
            ← Projects
          </Link>
          <h1 className="display truncate text-[clamp(2.25rem,4vw,3.5rem)]">
            {p.title || "New project"}
            <span className="text-faint">.</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="meta mr-2">unsaved changes</span>}
          <button type="button" className="btn-ghost" disabled={!dirty || save.isPending} onClick={() => (setP(saved), setErrors({}))}>
            Discard
          </button>
          <button type="submit" className="btn-primary" disabled={save.isPending || (!dirty && id !== null)}>
            <span>{save.isPending ? "Saving…" : id === null ? "Create project" : "Save"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Block title="Basics">
            <TextField label="Title" value={p.title} onChange={(v) => set({ title: v })} error={err("title")} max={160} />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="Short title" value={p.shortTitle} onChange={(v) => set({ shortTitle: v })} error={err("shortTitle")} max={60} help="Used on the hover preview card." />
              <TextField
                label="Address"
                mono
                value={p.slug}
                onChange={(v) => {
                  setSlugTouched(true);
                  set({ slug: v });
                }}
                error={err("slug")}
                help="Lowercase letters, numbers and dashes. Also used in analytics."
              />
            </div>
            <TextField label="Summary" multiline value={p.summary} onChange={(v) => set({ summary: v })} error={err("summary")} max={600} help="One or two sentences: what it is and who it is for." />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="Your role" value={p.role} onChange={(v) => set({ role: v })} error={err("role")} max={300} help="e.g. “Back-end developer — server and database.”" />
              <TextField label="Small note" value={p.note} onChange={(v) => set({ note: v })} error={err("note")} max={300} help="Shown under the stack on stories." />
            </div>
          </Block>

          <Block title="Screenshot">
            <MediaField label="Image" value={p.imageId || null} onChange={(imageId, m) => set({ imageId, imageAlt: p.imageAlt || m.alt })} error={err("imageId")} help="Wide screenshots (16:10) look best. The top-left corner is what shows on the cards." />
            <TextField label="Alt text" value={p.imageAlt} onChange={(v) => set({ imageAlt: v })} error={err("imageAlt")} max={300} help="Describe what the screenshot shows, for screen readers and Google Images." />
          </Block>

          <Block title="Stack, links and numbers">
            <ChipsInput label="Stack" value={p.stack} onChange={(stack) => set({ stack })} max={12} placeholder="React, Express…" error={err("stack")} />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="Source code link" mono value={p.sourceUrl} onChange={(v) => set({ sourceUrl: v })} error={err("sourceUrl")} placeholder="https://github.com/…" help="Leave empty for private code." />
              <TextField label="Live site link" mono value={p.liveUrl} onChange={(v) => set({ liveUrl: v })} error={err("liveUrl")} placeholder="https://…" />
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1.5 text-[13px] font-semibold">Big numbers <span className="meta font-normal">up to 4 · stories only</span></legend>
              {p.stats.map((s, i) => (
                <div key={i} className="flex items-end gap-2">
                  <TextField className="w-28" label="Value" value={s.value} onChange={(v) => set({ stats: p.stats.map((x, j) => (j === i ? { ...x, value: v } : x)) })} error={err(`stats.${i}.value`)} placeholder="200+" />
                  <TextField className="flex-1" label="Label" value={s.label} onChange={(v) => set({ stats: p.stats.map((x, j) => (j === i ? { ...x, label: v } : x)) })} error={err(`stats.${i}.label`)} placeholder="api endpoints" />
                  <span className="flex gap-1 pb-1.5">
                    <MoveButtons index={i} length={p.stats.length} label={s.label || "number"} onMove={(to) => set({ stats: move(p.stats, i, to) })} />
                    <button type="button" className="icon-btn h-8 w-8 hover:!border-bad hover:!text-bad" aria-label="Remove number" onClick={() => set({ stats: p.stats.filter((_, j) => j !== i) })}>
                      <Icon name="trash" size={13} />
                    </button>
                  </span>
                </div>
              ))}
              <button type="button" className="btn-ghost self-start" disabled={p.stats.length >= 4} onClick={() => set({ stats: [...p.stats, { value: "", label: "" }] })}>
                <Icon name="plus" size={14} />
                Add number
              </button>
            </fieldset>
          </Block>

          <section className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Story</h2>
                <p className="mt-1 max-w-[62ch] text-[13.5px] leading-relaxed text-mute">
                  Featured projects are told in steps — usually <em>the problem</em>, <em>what I built</em>, <em>what changed</em>. A step can add a flow of stages, supporting facts, or a feature grid.
                  {!p.featured && " Steps only show on the site when the project is featured."}
                </p>
              </div>
            </div>
            {err("steps") && <p className="mt-3 text-[12.5px] text-bad">{err("steps")}</p>}
            <ol className="mt-5 flex flex-col gap-4">
              {p.steps.map((s, i) => (
                <li key={i} className={`rounded-xl border p-5 ${stepErrors(i).length ? "border-bad/50" : "border-line"}`}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="meta">step {i + 1}</span>
                    <span className="flex gap-1">
                      <MoveButtons index={i} length={p.steps.length} label={`step ${i + 1}`} onMove={(to) => set({ steps: move(p.steps, i, to) })} />
                      <button type="button" className="icon-btn h-8 w-8 hover:!border-bad hover:!text-bad" aria-label={`Remove step ${i + 1}`} onClick={() => set({ steps: p.steps.filter((_, j) => j !== i) })}>
                        <Icon name="trash" size={13} />
                      </button>
                    </span>
                  </div>
                  <div className="flex flex-col gap-5">
                    <TextField label="Label" value={s.label} onChange={(v) => setStep(i, { label: v })} error={err(`steps.${i}.label`)} max={60} help="Shown small, lowercase, beside the text." />
                    <TextField label="Text" multiline rows={3} value={s.text} onChange={(v) => setStep(i, { text: v })} error={err(`steps.${i}.text`)} max={2000} />
                    <details className="group rounded-lg border border-line" open={s.flow.length + s.facts.length + s.features.length > 0}>
                      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[13px] font-semibold">
                        Extras <span className="meta font-normal">{s.flow.length} stages · {s.facts.length} facts · {s.features.length} features</span>
                      </summary>
                      <div className="flex flex-col gap-6 border-t border-line p-4">
                        <StringList label="Flow of stages" itemLabel="stage" value={s.flow} onChange={(flow) => setStep(i, { flow })} addLabel="Add stage" max={12} help="Shown as a line of dots that light up one after another." />
                        <StringList label="Facts" itemLabel="fact" multiline value={s.facts} onChange={(facts) => setStep(i, { facts })} addLabel="Add fact" max={8} />
                        <fieldset className="flex flex-col gap-2">
                          <legend className="mb-1.5 text-[13px] font-semibold">Feature grid</legend>
                          {s.features.map((f, k) => (
                            <div key={k} className="grid gap-2 rounded-lg border border-line p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
                              <input className="input" aria-label={`Feature ${k + 1} title`} placeholder="Title" value={f.title} onChange={(e) => setStep(i, { features: s.features.map((x, j) => (j === k ? { ...x, title: e.target.value } : x)) })} />
                              <input className="input" aria-label={`Feature ${k + 1} text`} placeholder="One line about it" value={f.text} onChange={(e) => setStep(i, { features: s.features.map((x, j) => (j === k ? { ...x, text: e.target.value } : x)) })} />
                              <span className="flex gap-1">
                                <MoveButtons index={k} length={s.features.length} label={f.title || "feature"} onMove={(to) => setStep(i, { features: move(s.features, k, to) })} />
                                <button type="button" className="icon-btn h-8 w-8" aria-label="Remove feature" onClick={() => setStep(i, { features: s.features.filter((_, j) => j !== k) })}>
                                  <Icon name="trash" size={13} />
                                </button>
                              </span>
                            </div>
                          ))}
                          <button type="button" className="btn-ghost self-start" disabled={s.features.length >= 8} onClick={() => setStep(i, { features: [...s.features, { title: "", text: "" }] })}>
                            <Icon name="plus" size={14} />
                            Add feature
                          </button>
                        </fieldset>
                      </div>
                    </details>
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="btn mt-4"
              disabled={p.steps.length >= 6}
              onClick={() => set({ steps: [...p.steps, { label: STEP_PRESETS[p.steps.length] ?? "", text: "", flow: [], facts: [], features: [] }] })}
            >
              <Icon name="plus" size={15} />
              <span>Add step</span>
            </button>
          </section>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-20">
          <section className="card flex flex-col gap-5 p-5">
            <Switch label="Show on the site" checked={p.status === "published"} onChange={(v) => set({ status: v ? "published" : "draft" })} help="Hidden projects stay here as drafts and never leave the server." />
            <Switch label="Featured story" checked={p.featured} onChange={(featured) => set({ featured })} help="Told in full under “Two stories”, with steps and big numbers." />
            {p.featured && <TextField label="Kicker" value={p.kicker} onChange={(v) => set({ kicker: v })} error={err("kicker")} max={120} placeholder="case 03 — client app" />}
          </section>
          <section className="card overflow-hidden" aria-label="Preview">
            <p className="meta border-b border-line px-5 py-3">preview · more work row</p>
            <div className="flex items-center gap-4 px-5 py-5">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[18px] font-semibold tracking-[-0.02em]">{p.title || "Project title"}</span>
                {p.role && <span className="meta mt-1 block truncate">role: {p.role.toLowerCase()}</span>}
                <span className="meta mt-1 block truncate">{p.stack.join(", ").toLowerCase() || "stack"}</span>
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fg">
                <Icon name="arrowUpRight" size={14} />
              </span>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
