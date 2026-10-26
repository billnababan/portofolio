import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorBlock, PageHeader, SectionTitle, Spinner } from "../components/ui/Bits";
import { useFeedback } from "../components/ui/Feedback";
import { TextField } from "../components/ui/Form";
import { useAuth } from "../hooks/useAuth";
import { api, ApiError } from "../lib/api";
import { ago } from "../lib/format";
import type { Session } from "../lib/types";

// "Chrome on macOS" from a user-agent string; good enough to recognise your own devices.
const device = (ua: string) => {
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "unknown system";
  return `${browser} on ${os}`;
};

export function Account() {
  const { data: me } = useAuth();
  return (
    <>
      <PageHeader eyebrow="site" title="Account" description={me ? `${me.user.name} · ${me.user.email} · ${me.user.role}` : undefined} />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <PasswordCard />
        <Sessions />
      </div>
    </>
  );
}

function PasswordCard() {
  const { toast } = useFeedback();
  const [d, setD] = useState({ currentPassword: "", newPassword: "", repeat: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: () => api.put("/auth/password", { currentPassword: d.currentPassword, newPassword: d.newPassword }),
    onSuccess: () => {
      setD({ currentPassword: "", newPassword: "", repeat: "" });
      setErrors({});
      toast("Password changed — other devices were signed out");
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (e) => setErrors(e instanceof ApiError ? e.fields : { newPassword: e.message }),
  });
  const submit = () => {
    if (d.newPassword !== d.repeat) return setErrors({ repeat: "The two new passwords are different." });
    save.mutate();
  };

  return (
    <section className="card p-6">
      <SectionTitle title="Password" />
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <TextField label="Current password" type="password" autoComplete="current-password" value={d.currentPassword} onChange={(currentPassword) => setD({ ...d, currentPassword })} error={errors.currentPassword} />
        <TextField label="New password" type="password" autoComplete="new-password" value={d.newPassword} onChange={(newPassword) => setD({ ...d, newPassword })} error={errors.newPassword} help="At least 10 characters. A short sentence works well." />
        <TextField label="New password again" type="password" autoComplete="new-password" value={d.repeat} onChange={(repeat) => setD({ ...d, repeat })} error={errors.repeat} />
        <button type="submit" className="btn-primary self-start" disabled={save.isPending || !d.currentPassword || !d.newPassword}>
          <span>{save.isPending ? "Saving…" : "Change password"}</span>
        </button>
      </form>
    </section>
  );
}

function Sessions() {
  const qc = useQueryClient();
  const { toast } = useFeedback();
  const q = useQuery({ queryKey: ["sessions"], queryFn: () => api.get<{ sessions: Session[] }>("/auth/sessions"), select: (d) => d.sessions });
  const revoke = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/sessions/${id}`),
    onSuccess: () => (toast("Signed out that device"), qc.invalidateQueries({ queryKey: ["sessions"] })),
    onError: (e) => toast(e.message, "error"),
  });

  return (
    <section className="card p-6">
      <SectionTitle title="Signed-in devices" />
      {q.isPending && <Spinner />}
      {q.isError && <ErrorBlock error={q.error} retry={() => q.refetch()} />}
      <ul className="flex flex-col">
        {q.data?.map((s) => (
          <li key={s.id} className="flex items-center gap-4 border-b border-line py-3 last:border-b-0">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">
                {device(s.user_agent)} {s.current && <span className="chip ml-1">this device</span>}
              </p>
              <p className="meta mt-0.5">
                {s.ip} · active {ago(s.last_seen_at)}
              </p>
            </div>
            {!s.current && (
              <button type="button" className="btn" onClick={() => revoke.mutate(s.id)} disabled={revoke.isPending}>
                <span>Sign out</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
