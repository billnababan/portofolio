import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorBlock, PageHeader, Spinner } from "../components/ui/Bits";
import { useFeedback } from "../components/ui/Feedback";
import { Segmented, Switch, TextField } from "../components/ui/Form";
import { Icon } from "../components/ui/Icon";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";
import { api, ApiError } from "../lib/api";
import { ago } from "../lib/format";
import type { Role, UserRow } from "../lib/types";

const ROLES = [
  { value: "editor" as const, label: "Editor" },
  { value: "owner" as const, label: "Owner" },
];

export function Users() {
  const { data: me } = useAuth();
  const qc = useQueryClient();
  const { toast, confirm } = useFeedback();
  const [editing, setEditing] = useState<UserRow | "new" | null>(null);
  const [resetting, setResetting] = useState<UserRow | null>(null);
  const q = useQuery({ queryKey: ["users"], queryFn: () => api.get<{ users: UserRow[] }>("/users"), select: (d) => d.users });
  const remove = useMutation({
    mutationFn: (u: UserRow) => api.delete(`/users/${u.id}`),
    onSuccess: (_d, u) => (toast(`Deleted ${u.name}`), qc.invalidateQueries({ queryKey: ["users"] })),
    onError: (e) => toast(e.message, "error"),
  });

  return (
    <>
      <PageHeader
        eyebrow="site"
        title="Users"
        description="Editors can change content, media and SEO and publish. Owners can also manage users."
        actions={
          <button type="button" className="btn-primary" onClick={() => setEditing("new")}>
            <Icon name="plus" size={15} />
            <span>Add user</span>
          </button>
        }
      />
      {q.isPending && <Spinner />}
      {q.isError && <ErrorBlock error={q.error} retry={() => q.refetch()} />}
      {q.data && (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>name</th>
                <th>role</th>
                <th>last sign-in</th>
                <th className="text-right">
                  <span className="sr-only">actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {q.data.map((u) => (
                <tr key={u.id} className={u.isActive ? "" : "opacity-50"}>
                  <td>
                    <p className="font-semibold">
                      {u.name} {u.id === me?.user.id && <span className="meta">· you</span>}
                    </p>
                    <p className="text-[13px] text-mute">{u.email}</p>
                  </td>
                  <td>
                    <span className="chip">{u.isActive ? u.role : "deactivated"}</span>
                  </td>
                  <td className="text-mute">{u.lastLoginAt ? ago(u.lastLoginAt) : "never"}</td>
                  <td>
                    <span className="flex justify-end gap-1">
                      <button type="button" className="icon-btn h-8 w-8" aria-label={`Edit ${u.name}`} onClick={() => setEditing(u)}>
                        <Icon name="edit" size={13} />
                      </button>
                      <button type="button" className="icon-btn h-8 w-8" aria-label={`Set a new password for ${u.name}`} title="Set a new password" onClick={() => setResetting(u)}>
                        <Icon name="key" size={13} />
                      </button>
                      {u.id !== me?.user.id && (
                        <button
                          type="button"
                          className="icon-btn h-8 w-8 hover:!border-bad hover:!text-bad"
                          aria-label={`Delete ${u.name}`}
                          onClick={async () => {
                            if (await confirm({ title: `Delete ${u.name}?`, body: "They are signed out and can no longer log in. Their past activity stays in the log.", action: "Delete user", danger: true }))
                              remove.mutate(u);
                          }}
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing !== null && <UserSheet user={editing === "new" ? null : editing} isSelf={editing !== "new" && editing.id === me?.user.id} onClose={() => setEditing(null)} />}
      {resetting && <PasswordDialog user={resetting} onClose={() => setResetting(null)} />}
    </>
  );
}

function UserSheet({ user, isSelf, onClose }: { user: UserRow | null; isSelf: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useFeedback();
  const [d, setD] = useState({ name: user?.name ?? "", email: user?.email ?? "", role: (user?.role ?? "editor") as Role, isActive: user?.isActive ?? true, password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => (user ? api.put(`/users/${user.id}`, { name: d.name, role: d.role, isActive: d.isActive }) : api.post("/users", { name: d.name, email: d.email, role: d.role, password: d.password })),
    onSuccess: () => {
      toast(user ? "Saved" : `${d.name} can now sign in`);
      qc.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (e) => {
      setErrors(e instanceof ApiError ? e.fields : {});
      toast(e.message, "error");
    },
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={user ? `Edit ${user.name}` : "Add user"}
      variant="sheet"
      size="sm"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" disabled={save.isPending} onClick={() => save.mutate()}>
            <span>{save.isPending ? "Saving…" : user ? "Save" : "Add user"}</span>
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <TextField label="Name" value={d.name} onChange={(name) => setD({ ...d, name })} error={errors.name} max={120} />
        {user ? (
          <div>
            <p className="text-[13px] font-semibold">Email</p>
            <p className="mt-1 text-[14px] text-mute">{user.email}</p>
          </div>
        ) : (
          <TextField label="Email" type="email" value={d.email} onChange={(email) => setD({ ...d, email })} error={errors.email} autoComplete="off" />
        )}
        {!isSelf && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[13px] font-semibold">Role</p>
            <Segmented label="Role" value={d.role} options={ROLES} onChange={(role) => setD({ ...d, role })} />
          </div>
        )}
        {!user && <TextField label="Password" type="password" value={d.password} onChange={(password) => setD({ ...d, password })} error={errors.password} autoComplete="new-password" help="At least 10 characters. Share it privately; they can change it under Account." />}
        {user && !isSelf && <Switch label="Can sign in" checked={d.isActive} onChange={(isActive) => setD({ ...d, isActive })} help="Turning this off signs them out everywhere." />}
      </div>
    </Modal>
  );
}

function PasswordDialog({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const { toast } = useFeedback();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const save = useMutation({
    mutationFn: () => api.put(`/users/${user.id}/password`, { password }),
    onSuccess: () => (toast(`New password set — ${user.name} was signed out`), onClose()),
    onError: (e) => setError(e instanceof ApiError ? (e.fields.password ?? e.message) : e.message),
  });
  return (
    <Modal
      open
      onClose={onClose}
      title={`New password for ${user.name}`}
      size="sm"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" disabled={save.isPending || !password} onClick={() => save.mutate()}>
            <span>Set password</span>
          </button>
        </>
      }
    >
      <TextField label="Password" type="password" value={password} onChange={setPassword} error={error} autoComplete="new-password" help="They are signed out of every device." />
    </Modal>
  );
}
