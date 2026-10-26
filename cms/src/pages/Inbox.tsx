import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState, ErrorBlock, PageHeader, Spinner } from "../components/ui/Bits";
import { useFeedback } from "../components/ui/Feedback";
import { Segmented } from "../components/ui/Form";
import { Icon } from "../components/ui/Icon";
import { api } from "../lib/api";
import { ago, dateTime } from "../lib/format";
import type { Message, MessageStatus } from "../lib/types";

type Folder = "inbox" | "archived" | "spam";
type ListData = { messages: Message[]; total: number; page: number; pageSize: number; counts: Record<MessageStatus, number> };

export function Inbox() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const folder = (params.get("folder") as Folder) || "inbox";
  const page = Number(params.get("page") || 1);
  const [q, setQ] = useState(params.get("q") ?? "");

  const set = (patch: Record<string, string>) =>
    setParams(
      (p) => {
        for (const [k, v] of Object.entries(patch)) v ? p.set(k, v) : p.delete(k);
        return p;
      },
      { replace: true },
    );

  const list = useQuery({
    queryKey: ["messages", folder, params.get("q") ?? "", page],
    queryFn: () => api.get<ListData>(`/messages?status=${folder}&page=${page}&q=${encodeURIComponent(params.get("q") ?? "")}`),
    placeholderData: keepPreviousData,
  });
  const counts = list.data?.counts;
  const pages = list.data ? Math.max(1, Math.ceil(list.data.total / list.data.pageSize)) : 1;

  return (
    <>
      <PageHeader eyebrow="from the contact form" title="Inbox" description="Messages people send from the site. A new message is marked read when you open it." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          label="Folder"
          value={folder}
          onChange={(f) => set({ folder: f === "inbox" ? "" : f, page: "" })}
          options={[
            { value: "inbox", label: "Inbox", count: counts ? counts.new + counts.read : undefined },
            { value: "archived", label: "Archived", count: counts?.archived },
            { value: "spam", label: "Spam", count: counts?.spam },
          ]}
        />
        <form
          className="relative min-w-[220px] flex-1"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            set({ q, page: "" });
          }}
        >
          <Icon name="seo" size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
          <input className="input pl-10" placeholder="Search name, email or text — press Enter" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search messages" />
        </form>
      </div>

      <div className="grid min-h-[560px] grid-cols-1 overflow-hidden rounded-2xl border border-line lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className={`flex flex-col border-line lg:border-r ${id ? "max-lg:hidden" : ""}`}>
          {list.isPending && <Spinner />}
          {list.isError && <div className="p-4"><ErrorBlock error={list.error} /></div>}
          {list.data && list.data.messages.length === 0 && (
            <EmptyState icon="inbox" title={folder === "inbox" ? "Inbox zero" : "Nothing here"} body={params.get("q") ? "No message matches that search." : "New messages from the contact form show up here."} />
          )}
          <ul className={`flex-1 ${list.isPlaceholderData ? "is-refreshing" : ""}`}>
            {list.data?.messages.map((m) => (
              <li key={m.id}>
                <Link
                  to={`/inbox/${m.id}?${params.toString()}`}
                  aria-current={String(m.id) === id ? "true" : undefined}
                  className={`flex flex-col gap-1 border-b border-line px-4 py-3.5 transition-colors ${String(m.id) === id ? "bg-raised" : "hover:bg-card"}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className={`flex min-w-0 items-center gap-2 truncate text-[14px] ${m.status === "new" ? "font-semibold" : ""}`}>
                      {m.status === "new" && <span className="h-2 w-2 shrink-0 rounded-full bg-fg" aria-label="new" />}
                      {m.name}
                    </span>
                    <span className="meta shrink-0">{ago(m.createdAt)}</span>
                  </span>
                  <span className="line-clamp-2 text-[13px] leading-snug text-mute">{m.body}</span>
                </Link>
              </li>
            ))}
          </ul>
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
              <button type="button" className="btn-ghost" disabled={page <= 1} onClick={() => set({ page: String(page - 1) })}>
                Newer
              </button>
              <span className="meta num">
                {page} / {pages}
              </span>
              <button type="button" className="btn-ghost" disabled={page >= pages} onClick={() => set({ page: String(page + 1) })}>
                Older
              </button>
            </div>
          )}
        </div>
        <div className={id ? "" : "max-lg:hidden"}>
          {id ? <MessageView id={Number(id)} /> : <EmptyState icon="mail" title="Pick a message" body="Choose a message on the left to read it, reply, archive it or mark it as spam." />}
        </div>
      </div>
    </>
  );
}

function MessageView({ id }: { id: number }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast, confirm } = useFeedback();
  const q = useQuery({ queryKey: ["message", id], queryFn: () => api.get<{ message: Message }>(`/messages/${id}`) });

  const refreshLists = () => qc.invalidateQueries({ queryKey: ["messages"] });
  // Opening marks a new message read on the server: refresh the list and counts once it has loaded.
  useEffect(() => {
    if (q.dataUpdatedAt) qc.invalidateQueries({ queryKey: ["messages"] });
  }, [q.dataUpdatedAt, qc]);

  const setStatus = useMutation({
    mutationFn: (status: MessageStatus) => api.patch(`/messages/${id}`, { status }),
    onSuccess: (_d, status) => {
      toast(status === "archived" ? "Archived" : status === "spam" ? "Marked as spam" : "Moved to inbox");
      refreshLists();
      navigate(`/inbox?${params.toString()}`);
    },
    onError: (e) => toast(e.message, "error"),
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/messages/${id}`),
    onSuccess: () => {
      toast("Deleted");
      refreshLists();
      navigate(`/inbox?${params.toString()}`);
    },
  });

  if (q.isPending) return <Spinner />;
  if (q.isError) return <div className="p-6"><ErrorBlock error={q.error} /></div>;
  const m = q.data.message;
  const subject = encodeURIComponent("Re: your message on my portfolio");

  return (
    <article className="rise flex h-full flex-col" aria-labelledby="msg-from">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6">
        <div className="min-w-0">
          <Link to={`/inbox?${params.toString()}`} className="btn-ghost -ml-3 mb-2 lg:hidden">
            ← Back
          </Link>
          <h2 id="msg-from" className="text-[22px] font-semibold tracking-[-0.015em]">
            {m.name}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-mute">
            <a href={`mailto:${m.email}`} className="ul text-fg">
              {m.email}
            </a>
            <span className="meta">{dateTime(m.createdAt)}</span>
            {m.sourcePage && <span className="meta">from {m.sourcePage}</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="btn-primary" href={`mailto:${m.email}?subject=${subject}`}>
            <Icon name="mail" size={15} />
            <span>Reply</span>
          </a>
          <button
            type="button"
            className="icon-btn"
            title="Copy email"
            aria-label="Copy email address"
            onClick={() => navigator.clipboard.writeText(m.email).then(() => toast("Email copied"))}
          >
            <Icon name="copy" size={15} />
          </button>
        </div>
      </div>
      <p className="flex-1 whitespace-pre-wrap p-6 text-[15px] leading-relaxed">{m.body}</p>
      <div className="flex flex-wrap gap-2 border-t border-line p-4">
        {m.status === "archived" || m.status === "spam" ? (
          <button type="button" className="btn" onClick={() => setStatus.mutate("read")}>
            <Icon name="inbox" size={15} />
            <span>Move to inbox</span>
          </button>
        ) : (
          <button type="button" className="btn" onClick={() => setStatus.mutate("archived")}>
            <Icon name="archive" size={15} />
            <span>Archive</span>
          </button>
        )}
        {m.status !== "spam" && (
          <button type="button" className="btn" onClick={() => setStatus.mutate("spam")}>
            <Icon name="spam" size={15} />
            <span>Spam</span>
          </button>
        )}
        <button
          type="button"
          className="btn-ghost ml-auto hover:!text-bad"
          onClick={async () => {
            if (await confirm({ title: "Delete this message?", body: `The message from ${m.name} will be removed for good.`, action: "Delete", danger: true })) remove.mutate();
          }}
        >
          <Icon name="trash" size={15} />
          Delete
        </button>
      </div>
    </article>
  );
}
