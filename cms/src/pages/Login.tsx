import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/login", { email, password });
      await qc.invalidateQueries({ queryKey: ["me"] });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError && Object.keys(err.fields).length ? Object.values(err.fields)[0]! : err instanceof Error ? err.message : "Could not log in.");
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <section className="relative hidden overflow-hidden border-r border-line p-10 lg:flex lg:flex-col lg:justify-between">
        <p className="flex items-center gap-2.5 text-[15px] font-bold">
          <span className="h-2 w-2 rounded-full bg-fg" aria-hidden="true" />© bill jeferson <span className="meta">/ cms</span>
        </p>
        <div>
          <p className="display text-[clamp(4rem,8vw,8rem)] uppercase">
            <span className="text-faint line-through decoration-[0.08em]">Edit</span>
            <br />
            Publish.
          </p>
          <p className="mt-6 max-w-[40ch] text-[15px] leading-relaxed text-mute">Content, inbox, traffic and search for the portfolio — in one place, then live with one press.</p>
        </div>
        <p className="meta">private · not indexed</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="rise flex w-full max-w-[360px] flex-col gap-5" noValidate>
          <div>
            <h1 className="display text-[56px]">
              Log in<span className="text-faint">.</span>
            </h1>
            <p className="mt-2 text-mute">Use the account you were given.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px] font-semibold">
              Email
            </label>
            <input id="email" type="email" autoComplete="username" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13px] font-semibold">
              Password
            </label>
            <input id="password" type="password" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && (
            <p role="alert" className="text-[13px] text-bad">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary min-h-[46px]" disabled={busy || !email || !password}>
            <span>{busy ? "Checking…" : "Log in"}</span>
          </button>
          <p className="text-[12.5px] leading-relaxed text-mute">Locked out? On the server run <code className="font-mono text-fg">npm run user:create</code>.</p>
        </form>
      </section>
    </main>
  );
}
