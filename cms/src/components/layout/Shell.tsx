import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Me, PublishStatus } from "../../lib/types";
import { Icon, type IconName } from "../ui/Icon";

type Item = { to: string; label: string; icon: IconName; count?: number; end?: boolean };

function NavGroup({ title, items, onNavigate }: { title: string; items: Item[]; onNavigate: () => void }) {
  return (
    <div>
      <p className="meta mb-1.5 px-3">{title}</p>
      <ul className="flex flex-col gap-0.5">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex min-h-[38px] items-center gap-3 rounded-lg px-3 text-[13.5px] transition-colors ${isActive ? "bg-fg font-semibold text-bg" : "text-mute hover:bg-raised hover:text-fg"}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={it.icon} size={16} />
                  <span className="flex-1">{it.label}</span>
                  {it.count ? (
                    <span className={`num min-w-[22px] rounded-full px-1.5 text-center font-mono text-[11px] leading-[20px] ${isActive ? "bg-bg/15 text-bg" : "bg-fg text-bg"}`}>{it.count}</span>
                  ) : null}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Shell({ me }: { me: Me }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Small counts for the sidebar, refreshed in the background.
  const inbox = useQuery({ queryKey: ["messages", "inbox-count"], queryFn: () => api.get<{ counts: Record<string, number> }>("/messages?status=inbox"), refetchInterval: 60_000 });
  const publish = useQuery({ queryKey: ["publish"], queryFn: () => api.get<PublishStatus>("/publish"), refetchInterval: 60_000 });
  const pending = publish.data?.pending.length ?? 0;

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    qc.clear();
    qc.setQueryData(["me"], null);
    navigate("/login");
  };

  const close = () => setMenuOpen(false);
  const sidebar = (
    <nav aria-label="CMS" className="flex h-full flex-col gap-6 overflow-y-auto px-3 pb-4 pt-5">
      <a href={me.siteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 text-[15px] font-bold">
        <span className="h-2 w-2 rounded-full bg-fg" aria-hidden="true" />
        <span>© bill jeferson</span>
        <span className="meta">/ cms</span>
      </a>
      <NavGroup title="overview" onNavigate={close} items={[{ to: "/", label: "Dashboard", icon: "dashboard", end: true }, { to: "/analytics", label: "Analytics", icon: "chart" }]} />
      <NavGroup
        title="content"
        onNavigate={close}
        items={[
          { to: "/content/profile", label: "Profile & texts", icon: "profile" },
          { to: "/content/projects", label: "Projects", icon: "projects" },
          { to: "/content/skills", label: "Skills", icon: "layers" },
          { to: "/content/certifications", label: "Certifications", icon: "award" },
          { to: "/library", label: "Media", icon: "image" },
        ]}
      />
      <NavGroup
        title="audience & growth"
        onNavigate={close}
        items={[
          { to: "/inbox", label: "Inbox", icon: "inbox", count: inbox.data?.counts.new },
          { to: "/seo", label: "SEO", icon: "seo" },
        ]}
      />
      <NavGroup
        title="site"
        onNavigate={close}
        items={[
          { to: "/publish", label: "Publish", icon: "publish", count: pending },
          { to: "/activity", label: "Activity", icon: "activity" },
          ...(me.user.role === "owner" ? [{ to: "/users", label: "Users", icon: "users" as const }] : []),
          { to: "/account", label: "Account", icon: "key" },
        ]}
      />
      <div className="mt-auto flex items-center gap-3 rounded-xl border border-line p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fg text-[13px] font-bold text-bg" aria-hidden="true">
          {me.user.name
            .split(" ")
            .slice(0, 2)
            .map((w) => w[0])
            .join("")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">{me.user.name}</p>
          <p className="meta">{me.user.role}</p>
        </div>
        <button type="button" onClick={logout} className="icon-btn" aria-label="Log out" title="Log out">
          <Icon name="logout" size={15} />
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh border-r border-line lg:block">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-bg/70" aria-label="Close menu" onClick={close} />
          <aside className="absolute inset-y-0 left-0 w-[280px] border-r border-line bg-bg">{sidebar}</aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur sm:px-6">
          <button type="button" className="btn-ghost -ml-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Icon name="menu" size={18} />
            <span>Menu</span>
          </button>
          <p className="meta hidden lg:block">{me.siteUrl.replace(/^https?:\/\//, "")}</p>
          <div className="flex items-center gap-2">
            <a href={me.siteUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <Icon name="globe" size={15} />
              <span className="hidden sm:inline">View site</span>
            </a>
            <NavLink to="/publish" className={pending > 0 ? "btn-primary" : "btn"}>
              <Icon name="publish" size={15} />
              <span>{pending > 0 ? `Publish · ${pending}` : "Up to date"}</span>
            </NavLink>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[1320px] px-4 pb-24 pt-8 sm:px-6 lg:px-10 lg:pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
