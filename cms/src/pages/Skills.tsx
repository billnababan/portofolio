import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorBlock, PageHeader, Spinner } from "../components/ui/Bits";
import { useFeedback } from "../components/ui/Feedback";
import { FormCard } from "../components/ui/FormCard";
import { TextField } from "../components/ui/Form";
import { Icon } from "../components/ui/Icon";
import { MoveButtons, move } from "../components/ui/Lists";
import { useUnsaved } from "../hooks/useUnsaved";
import { api, ApiError } from "../lib/api";
import type { SkillGroup } from "../lib/types";

type Draft = Omit<SkillGroup, "id" | "sortOrder">;

export function Skills() {
  const q = useQuery({ queryKey: ["skills"], queryFn: () => api.get<{ groups: SkillGroup[] }>("/skills"), select: (d) => d.groups });
  const qc = useQueryClient();
  const { toast } = useFeedback();
  const [adding, setAdding] = useState(false);
  // One guard for the whole page (the router allows a single blocker).
  const [dirtyForms, setDirtyForms] = useState<Record<string, boolean>>({});
  const report = useCallback((key: string, dirty: boolean) => setDirtyForms((m) => (m[key] === dirty ? m : { ...m, [key]: dirty })), []);
  useUnsaved(Object.values(dirtyForms).some(Boolean));
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["skills"] });
    qc.invalidateQueries({ queryKey: ["publish"] });
  };
  const reorder = useMutation({
    mutationFn: (ids: number[]) => api.put("/skills/order", { ids }),
    onSuccess: refresh,
    onError: (e) => toast(e.message, "error"),
  });

  return (
    <>
      <PageHeader
        eyebrow="content"
        title="Skills"
        description="Layers in the order a request travels — data, then the API, then the screen. Each layer opens on the site as an accordion with its skills."
        actions={
          <button type="button" className="btn-primary" onClick={() => setAdding(true)} disabled={adding}>
            <Icon name="plus" size={15} />
            <span>New layer</span>
          </button>
        }
      />
      {q.isPending && <Spinner />}
      {q.isError && <ErrorBlock error={q.error} retry={() => q.refetch()} />}
      <div className="flex flex-col gap-6">
        {q.data?.map((g, i) => (
          <GroupForm
            key={g.id}
            group={g}
            index={i}
            total={q.data.length}
            onMove={(to) => reorder.mutate(move(q.data, i, to).map((x) => x.id))}
            onDone={refresh}
            report={report}
          />
        ))}
        {adding && <GroupForm group={null} index={q.data?.length ?? 0} total={0} onMove={() => {}} onDone={() => (setAdding(false), refresh())} onCancel={() => setAdding(false)} report={report} />}
      </div>
    </>
  );
}

function GroupForm({
  group,
  index,
  total,
  onMove,
  onDone,
  onCancel,
  report,
}: {
  group: SkillGroup | null;
  index: number;
  total: number;
  onMove: (to: number) => void;
  onDone: () => void;
  onCancel?: () => void;
  report: (key: string, dirty: boolean) => void;
}) {
  const initial: Draft = group ? { title: group.title, subtitle: group.subtitle, items: group.items } : { title: "", subtitle: "", items: [{ name: "", tag: "" }] };
  const [d, setD] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast, confirm } = useFeedback();
  const dirty = JSON.stringify(d) !== JSON.stringify(initial) || group === null;
  const formKey = group ? String(group.id) : "new";
  useEffect(() => {
    report(formKey, group !== null && dirty);
    return () => report(formKey, false);
  }, [formKey, group, dirty, report]);
  const groupJson = JSON.stringify(group);
  useEffect(() => setD(initial), [groupJson]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useMutation({
    mutationFn: (draft: Draft) => (group ? api.put(`/skills/${group.id}`, draft) : api.post("/skills", draft)),
    onSuccess: () => {
      setErrors({});
      toast(`${d.title} saved`);
      onDone();
    },
    onError: (e) => {
      setErrors(e instanceof ApiError ? e.fields : {});
      toast(e.message, "error");
    },
  });
  const remove = useMutation({ mutationFn: () => api.delete(`/skills/${group!.id}`), onSuccess: () => (toast(`Deleted ${group!.title}`), onDone()) });

  return (
    <FormCard
      title={group ? `${String(index + 1).padStart(2, "0")} — ${group.title}` : "New layer"}
      dirty={dirty}
      saving={save.isPending}
      onSave={() => save.mutate(d)}
      onReset={() => (group ? setD(initial) : onCancel?.())}
    >
      {group && (
        <div className="-mt-2 flex justify-end gap-1">
          <MoveButtons index={index} length={total} label={group.title} onMove={onMove} />
          <button
            type="button"
            className="icon-btn h-8 w-8 hover:!border-bad hover:!text-bad"
            aria-label={`Delete ${group.title}`}
            onClick={async () => {
              if (await confirm({ title: `Delete “${group.title}”?`, body: `The layer and its ${group.items.length} skills are removed.`, action: "Delete layer", danger: true })) remove.mutate();
            }}
          >
            <Icon name="trash" size={13} />
          </button>
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="Title" value={d.title} onChange={(v) => setD({ ...d, title: v })} error={errors.title} max={80} placeholder="The API" />
        <TextField label="Subtitle" value={d.subtitle} onChange={(v) => setD({ ...d, subtitle: v })} error={errors.subtitle} max={160} placeholder="the logic in the middle" />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-[13px] font-semibold">Skills</legend>
        {d.items.map((it, k) => (
          <div key={k} className="flex items-center gap-2">
            <input className="input flex-1" aria-label={`Skill ${k + 1}`} placeholder="Express" value={it.name} aria-invalid={errors[`items.${k}.name`] ? true : undefined} onChange={(e) => setD({ ...d, items: d.items.map((x, j) => (j === k ? { ...x, name: e.target.value } : x)) })} />
            <input className="input w-40 font-mono text-[13px]" aria-label={`Tag for skill ${k + 1}`} placeholder="framework" value={it.tag} onChange={(e) => setD({ ...d, items: d.items.map((x, j) => (j === k ? { ...x, tag: e.target.value } : x)) })} />
            <MoveButtons index={k} length={d.items.length} label={it.name || "skill"} onMove={(to) => setD({ ...d, items: move(d.items, k, to) })} />
            <button type="button" className="icon-btn h-8 w-8" aria-label={`Remove ${it.name || "skill"}`} onClick={() => setD({ ...d, items: d.items.filter((_, j) => j !== k) })}>
              <Icon name="x" size={13} />
            </button>
          </div>
        ))}
        <button type="button" className="btn-ghost self-start" disabled={d.items.length >= 20} onClick={() => setD({ ...d, items: [...d.items, { name: "", tag: "" }] })}>
          <Icon name="plus" size={14} />
          Add skill
        </button>
      </fieldset>
    </FormCard>
  );
}
