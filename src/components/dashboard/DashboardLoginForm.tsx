"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/dashboard/(auth)/login/actions";

export function DashboardLoginForm({
  initialError = "",
  nextPath,
}: {
  initialError?: string;
  nextPath?: string;
}) {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const error = state?.error || initialError;

  return (
    <form
      action={formAction}
      className="mx-auto w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
    >
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      <h1 className="m-0 font-display text-xl font-bold text-ink">EPOS CMS</h1>
      <p className="mt-1 text-sm text-black/50">Вход для сотрудников</p>
      <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-black/45">
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={pending}
          className="mt-1.5 w-full rounded-lg border border-black/12 bg-white px-3 py-2.5 text-sm font-normal normal-case text-ink outline-none focus:border-primary"
        />
      </label>
      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-black/45">
        Пароль
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="mt-1.5 w-full rounded-lg border border-black/12 bg-white px-3 py-2.5 text-sm font-normal normal-case text-ink outline-none focus:border-primary"
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
