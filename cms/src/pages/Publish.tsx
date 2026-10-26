import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState, ErrorBlock, PageHeader, SectionTitle, Spinner } from "../components/ui/Bits";
import { useFeedback } from "../components/ui/Feedback";
import { TextField } from "../components/ui/Form";
import { Icon } from "../components/ui/Icon";
import { api } from "../lib/api";
import { ago, dateTime } from "../lib/format";
import type { PublishStatus } from "../lib/types";

export function Publish() {
  const qc = useQueryClient();
  const { toast } = useFeedback();
  const [note, setNote] = useState("");
  const q = useQuery({ queryKey: ["publish"], queryFn: () => api.get<PublishStatus>("/publish") });
  const run = useMutation({
    mutationFn: () => api.post("/publish", { note }),
    onSuccess: () => {
      setNote("");
      toast("Build started — the site updates in about a minute");
    },
    onError: (e) => toast(e.message, "error"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["publish"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });

  if (q.isPending) return <Spinner />;
  if (q.isError) return <ErrorBlock error={q.error} retry={() => q.refetch()} />;
  const s = q.data;

  return (
    <>
      <PageHeader
        eyebrow="site"
        title="Publish"
        description="Edits are saved here first. Publishing rebuilds the site on Vercel with everything below, so the live pages stay fast, static and crawlable."
      />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <section className="card p-6 xl:col-span-7">
          <SectionTitle title="Waiting to go live" meta={s.lastPublishedAt ? `last publish ${ago(s.lastPublishedAt)}` : "never published"} />
          {s.pending.length === 0 ? (
            <EmptyState icon="check" title="The site is up to date" body="Nothing changed since the last publish." />
          ) : (
            <ol className="flex flex-col">
              {s.pending.map((p) => (
                <li key={p.id} className="flex items-baseline gap-4 border-b border-line py-3 last:border-b-0">
                  <span className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full bg-fg" aria-hidden="true" />
                  <span className="flex-1 text-[14px]">{p.summary}</span>
                  <span className="meta shrink-0 text-right">
                    {p.user ?? "system"} · {ago(p.createdAt)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="card flex flex-col gap-5 p-6 xl:sticky xl:top-20 xl:col-span-5">
          <div>
            <p className="meta">changes</p>
            <p className="display num mt-1 text-[72px]">{s.pending.length}</p>
          </div>
          {s.configured ? (
            <>
              <TextField label="Note (optional)" value={note} onChange={setNote} max={200} placeholder="e.g. New reminder app screenshots" help="Shows in the history below." />
              <button type="button" className="btn-primary justify-center" disabled={run.isPending || s.pending.length === 0} onClick={() => run.mutate()}>
                <Icon name="publish" size={15} />
                <span>{run.isPending ? "Starting the build…" : s.pending.length === 0 ? "Nothing to publish" : `Publish ${s.pending.length} change${s.pending.length === 1 ? "" : "s"}`}</span>
              </button>
              <p className="text-[12.5px] leading-snug text-mute">The SEO audit runs again by itself a few minutes after the build.</p>
            </>
          ) : (
            <div className="rounded-xl border border-line-strong p-4 text-[13.5px] leading-relaxed text-mute">
              <p className="mb-2 font-semibold text-fg">Publishing is not connected yet</p>
              In Vercel open the project → Settings → Git → Deploy Hooks, create one for the <span className="font-mono text-fg">main</span> branch and put its URL in{" "}
              <span className="font-mono text-fg">VERCEL_DEPLOY_HOOK_URL</span> on the server. Then restart it.
            </div>
          )}
        </section>
      </div>

      <section className="card mt-5 p-6">
        <SectionTitle title="History" />
        {s.history.length === 0 ? (
          <p className="text-[13.5px] text-mute">No publishes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>when</th>
                  <th>by</th>
                  <th>note</th>
                  <th className="text-right">result</th>
                </tr>
              </thead>
              <tbody>
                {s.history.map((h) => (
                  <tr key={h.id}>
                    <td className="whitespace-nowrap font-mono text-[12.5px]">{dateTime(h.createdAt)}</td>
                    <td>{h.user ?? "—"}</td>
                    <td className="text-mute">{h.note || "—"}</td>
                    <td className="text-right">
                      {h.status === "triggered" ? (
                        <span className="chip">started</span>
                      ) : (
                        <span className="chip !border-bad/50 !text-bad" title={h.response}>
                          failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
