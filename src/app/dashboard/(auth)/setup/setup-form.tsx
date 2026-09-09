"use client";

import { useActionState } from "react";
import { bootstrapAdminAction } from "./actions";
import { dashBtnPrimary, dashCard, dashInput } from "@/styles/dashboard";

export function SetupForm() {
  const [state, formAction, pending] = useActionState(bootstrapAdminAction, null);

  return (
    <form
      action={formAction}
      className={`${dashCard} mx-auto w-full max-w-sm p-6`}
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
          className={`${dashInput} mt-1.5`}
        />
      </label>
      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-black/45">
        Имя
        <input
          name="display_name"
          type="text"
          disabled={pending}
          className={`${dashInput} mt-1.5`}
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
          className={`${dashInput} mt-1.5`}
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
          className={`${dashInput} mt-1.5`}
        />
      </label>
      {state?.error ? (
        <p className="mt-3 rounded-xl bg-primary-soft px-3 py-2.5 text-sm text-primary" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={`${dashBtnPrimary} mt-5 w-full disabled:opacity-60`}
      >
        {pending ? "Создание…" : "Создать владельца"}
      </button>
    </form>
  );
}
