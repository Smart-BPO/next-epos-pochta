"use client";

import { useActionState } from "react";
import { bootstrapAdminAction } from "./actions";

export function SetupForm() {
  const [state, formAction, pending] = useActionState(bootstrapAdminAction, null);

  return (
    <form
      action={formAction}
      className="mx-auto w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
    >
      <h1 className="m-0 font-display text-xl font-bold text-ink">
        Первый владелец
      </h1>
      <p className="mt-1 text-sm text-black/50">
        Создаётся один раз, пока нет сотрудников в CMS.
      </p>
      <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-black/45">
        Bootstrap-секрет
        <input
          name="bootstrap_secret"
          type="password"
          required
          disabled={pending}
          className="mt-1.5 w-full rounded-lg border border-black/12 px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </label>
      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-black/45">
        Имя
        <input
          name="display_name"
          type="text"
          disabled={pending}
          className="mt-1.5 w-full rounded-lg border border-black/12 px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </label>
      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-black/45">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          disabled={pending}
          className="mt-1.5 w-full rounded-lg border border-black/12 px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </label>
      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-black/45">
        Пароль
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={pending}
          className="mt-1.5 w-full rounded-lg border border-black/12 px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </label>
      {state?.error ? (
        <p className="mt-3 text-sm text-primary" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary mt-5 w-full disabled:opacity-60"
      >
        {pending ? "Создание…" : "Создать владельца"}
      </button>
    </form>
  );
}
