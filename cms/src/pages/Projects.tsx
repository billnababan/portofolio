import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState, ErrorBlock, PageHeader, Spinner, StatusPill } from "../components/ui/Bits";
import { useFeedback } from "../components/ui/Feedback";
import { Icon } from "../components/ui/Icon";
import { MoveButtons, move } from "../components/ui/Lists";
import { api } from "../lib/api";
import { ago } from "../lib/format";
import type { Project } from "../lib/types";

export const useProjects = () => useQuery({ queryKey: ["projects"], queryFn: () => api.get<{ projects: Project[] }>("/projects"), select: (d) => d.projects });

export function Projects() {
  const q = useProjects();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { toast, confirm } = useFeedback();

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["projects"] });
    qc.invalidateQueries({ queryKey: ["publish"] });
  };
  const reorder = useMutation({
    mutationFn: (ids: number[]) => api.put("/projects/order", { ids }),
    onMutate: async (ids) => {
      // Move the rows right away; roll back if the server says no.
      const before = qc.getQueryData<{ projects: Project[] }>(["projects"]);
      if (before) qc.setQueryData(["projects"], { projects: ids.map((id) => before.projects.find((p) => p.id === id)!) });
      return { before };
    },
    onError: (e, _ids, ctx) => {
      if (ctx?.before) qc.setQueryData(["projects"], ctx.before);
      toast(e.message, "error");
    },
    onSettled: refresh,
  });
  const toggle = useMutation({
    mutationFn: (p: Project) => api.patch(`/projects/${p.id}/status`, { status: p.status === "published" ? "draft" : "published" }),
    onSuccess: (_d, p) => {
      toast(p.status === "published" ? `“${p.title}” hidden from the site` : `“${p.title}” will show on the site`);
      refresh();
    },
    onError: (e) => toast(e.message, "error"),
  });
  const remove = useMutation({
    mutationFn: (p: Project) => api.delete(`/projects/${p.id}`),
    onSuccess: (_d, p) => {
      toast(`Deleted “${p.title}”`);
      refresh();
    },
    onError: (e) => toast(e.message, "error"),
  });

  const projects = q.data ?? [];
  const featured = projects.filter((p) => p.featured).length;

  return (
    <>
      <PageHeader
        eyebrow="content"
        title="Projects"
        description={
          <>
            Featured projects are told as full stories; the rest are listed under <em>More work</em>. The order here is the order on the site.
          </>
        }
        actions={
          <Link to="/content/projects/new" className="btn-primary">
            <Icon name="plus" size={15} />
            <span>New project</span>
          </Link>
        }
      />
      {q.isPending && <Spinner />}
      {q.isError && <ErrorBlock error={q.error} retry={() => q.refetch()} />}
      {q.data && projects.length === 0 && (
        <div className="card">
          <EmptyState icon="projects" title="No projects yet" body="Add the first one: a screenshot, a summary and the stack is enough to start." action={<Link to="/content/projects/new" className="btn-primary"><span>New project</span></Link>} />
        </div>
      )}
      {projects.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <span className="meta">
              {projects.length} projects · {featured} featured · {projects.filter((p) => p.status === "draft").length} hidden
            </span>
          </div>
          <ul>
            {projects.map((p, i) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4 last:border-b-0 md:flex-nowrap">
                <span className="meta num w-6 shrink-0 text-right">{String(i + 1).padStart(2, "0")}</span>
                <img src={p.imageUrl} alt="" className="h-14 w-[88px] shrink-0 rounded-lg border border-line bg-raised object-cover object-left-top" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <Link to={`/content/projects/${p.id}`} className="ul truncate text-[15px] font-semibold">
                      {p.title}
                    </Link>
                    {p.featured && (
                      <span className="chip">
                        <Icon name="star" size={11} />
                        story
                      </span>
                    )}
                  </p>
                  <p className="meta mt-1 truncate">{p.stack.join(", ")}</p>
                </div>
                <span className="hidden shrink-0 text-right lg:block">
                  <span className="meta block">{ago(p.updatedAt)}</span>
                  <span className="meta block">{p.updatedBy ?? ""}</span>
                </span>
                <button type="button" onClick={() => toggle.mutate(p)} className="shrink-0" title={p.status === "published" ? "Hide from the site" : "Show on the site"}>
                  <StatusPill status={p.status} />
                </button>
                <span className="flex shrink-0 items-center gap-1">
                  <MoveButtons index={i} length={projects.length} label={p.title} onMove={(to) => reorder.mutate(move(projects, i, to).map((x) => x.id))} />
                  <button type="button" className="icon-btn h-8 w-8" aria-label={`Edit ${p.title}`} onClick={() => navigate(`/content/projects/${p.id}`)}>
                    <Icon name="edit" size={13} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn h-8 w-8 hover:!border-bad hover:!text-bad"
                    aria-label={`Delete ${p.title}`}
                    onClick={async () => {
                      if (await confirm({ title: `Delete “${p.title}”?`, body: "The project and its story steps are removed. The screenshot stays in Media.", action: "Delete project", danger: true })) remove.mutate(p);
                    }}
                  >
                    <Icon name="trash" size={13} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
