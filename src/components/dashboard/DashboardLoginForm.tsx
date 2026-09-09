"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/dashboard/(auth)/login/actions";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { DashLocaleSwitcher } from "@/components/dashboard/DashLocaleSwitcher";
import { dashBtnPrimary, dashCard, dashInput } from "@/styles/dashboard";

export function DashboardLoginForm({
  initialError = "",
  nextPath,
}: {
  initialError?: string;
  nextPath?: string;
}) {
  const t = useDashT();
  const [state, formAction, pending] = useActionState(loginAction, null);
  const error = state?.error || initialError;

  return (
    <form
      action={formAction}
      className={`${dashCard} mx-auto w-full max-w-sm p-6`}
    >
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="m-0 font-display text-xl font-bold text-ink">
            {t.brand}
          </h1>
          <p className="mt-1 text-sm text-black/50">{t.login.lead}</p>
        </div>
        <DashLocaleSwitcher />
      </div>
      <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-black/45">
        {t.login.email}
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={pending}
          className={`${dashInput} mt-1.5 font-normal normal-case`}
        />
      </label>
      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-black/45">
        {t.login.password}
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className={`${dashInput} mt-1.5 font-normal normal-case`}
        />
      </label>
      {error ? (
        <p
          className="mt-3 rounded-xl bg-primary-soft px-3 py-2.5 text-sm text-primary"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={`${dashBtnPrimary} mt-5 w-full disabled:opacity-60`}
      >
        {pending ? t.common.loading : t.login.submit}
      </button>
    </form>
  );
}
