"use client";

import { useState } from "react";

function safeNextPath(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value.startsWith("/dashboard/")) return undefined;
  if (value.startsWith("//") || value.includes("://")) return undefined;
  if (value.startsWith("/dashboard/login") || value.startsWith("/dashboard/setup")) {
    return undefined;
  }
  return value;
}

export function DashboardLoginForm({
  initialError = "",
  nextPath,
}: {
  initialError?: string;
  nextPath?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = (await res.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error: string }
        | null;
      if (!result || !("ok" in result) || !result.ok) {
        setError(
          result && "error" in result ? result.error : "Не удалось войти",
        );
        return;
      }
      window.location.assign(safeNextPath(nextPath) ?? "/dashboard/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
    >
      <h1 className="m-0 font-display text-xl font-bold text-ink">EPOS CMS</h1>
      <p className="mt-1 text-sm text-black/50">Вход для сотрудников</p>
      <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-black/45">
        Email
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          className="mt-1.5 w-full rounded-lg border border-black/12 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      </label>
      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-black/45">
        Пароль
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
          className="mt-1.5 w-full rounded-lg border border-black/12 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      </label>
      {error ? (
        <p className="mt-3 text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary mt-5 w-full disabled:opacity-60"
      >
        {pending ? "Вход…" : "Войти"}
      </button>
    </form>
  );
}
