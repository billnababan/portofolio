import { useInfiniteQuery } from "@tanstack/react-query";
import { EmptyState, ErrorBlock, PageHeader, Spinner } from "../components/ui/Bits";
import { api } from "../lib/api";
import { date, dateTime } from "../lib/format";
import type { Activity as Row } from "../lib/types";

type Page = { activity: Row[]; nextBefore: number | null };

export function Activity() {
  const q = useInfiniteQuery({
    queryKey: ["activity", "all"],
    queryFn: ({ pageParam }) => api.get<Page>(`/activity?limit=50${pageParam ? `&before=${pageParam}` : ""}`),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextBefore,
  });

  const rows = q.data?.pages.flatMap((p) => p.activity) ?? [];
  // Group by day so a long log scans like a diary.
  const days = new Map<string, Row[]>();
  for (const r of rows) {
    const d = date(r.createdAt);
    days.set(d, [...(days.get(d) ?? []), r]);
  }

  return (
    <>
      <PageHeader eyebrow="site" title="Activity" description="Every change, sign-in and publish, newest first. Content changes are marked — those are what the next publish takes live." />
      {q.isPending && <Spinner />}
      {q.isError && <ErrorBlock error={q.error} retry={() => q.refetch()} />}
      {q.data && rows.length === 0 && (
        <div className="card">
          <EmptyState icon="activity" title="Nothing yet" body="Changes show up here as soon as someone saves something." />
        </div>
      )}
      <div className="flex flex-col gap-5">
        {[...days.entries()].map(([d, items]) => (
          <section key={d} className="card">
            <h2 className="meta border-b border-line px-5 py-3">{d}</h2>
            <ul>
              {items.map((a) => (
                <li key={a.id} className="flex items-baseline gap-4 border-b border-line px-5 py-3 last:border-b-0">
                  <span className="meta w-12 shrink-0">{dateTime(a.createdAt).split(", ")[1]}</span>
                  <span className="min-w-0 flex-1 text-[14px]">
                    <span className="font-semibold">{a.user ?? "System"}</span> <span className="text-mute">—</span> {a.summary}
                  </span>
                  {a.isContent && <span className="chip shrink-0">content</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {q.hasNextPage && (
        <div className="mt-6 flex justify-center">
          <button type="button" className="btn" onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}>
            <span>{q.isFetchingNextPage ? "Loading…" : "Show older"}</span>
          </button>
        </div>
      )}
    </>
  );
}
