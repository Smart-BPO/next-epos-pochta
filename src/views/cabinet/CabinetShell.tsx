"use client";

import type { Locale } from "@/i18n/config";
import { CabinetChrome } from "@/components/cabinet/CabinetChrome";
import { CabinetLoginView } from "@/components/cabinet/CabinetLoginView";
import {
  CabinetSessionProvider,
  useCabinetSessionProbe,
} from "@/components/cabinet/CabinetSession";
import { cabShell } from "@/styles/cabinet";

export {
  cabinetHref,
  cabinetShipmentHref,
} from "@/components/cabinet/nav";
export { useCabinetSession as useCabinet } from "@/components/cabinet/CabinetSession";

export function CabinetShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const { session, setSession, auth, value } = useCabinetSessionProbe(locale);

  if (session.state === "loading") {
    return (
      <div className={cabShell}>
        <div className="flex h-dvh w-full">
          <div className="hidden h-dvh w-[15.5rem] shrink-0 border-r border-[var(--dash-border)] bg-[var(--dash-surface)] lg:block">
            <div className="h-14 border-b border-[var(--dash-border)]" />
            <div className="space-y-2 p-3">
              <div className="h-16 animate-pulse rounded-2xl bg-black/[0.04]" />
              <div className="h-10 animate-pulse rounded-xl bg-black/[0.04]" />
              <div className="h-10 animate-pulse rounded-xl bg-black/[0.04]" />
              <div className="h-10 animate-pulse rounded-xl bg-black/[0.04]" />
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="h-14 border-b border-[var(--dash-border)] bg-[var(--dash-surface)]" />
            <div className="space-y-3 p-5">
              <div className="h-8 w-48 animate-pulse rounded-xl bg-black/[0.04]" />
              <div className="h-28 animate-pulse rounded-2xl bg-black/[0.04]" />
              <div className="h-28 animate-pulse rounded-2xl bg-black/[0.04]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (session.state === "guest" || !value) {
    return (
      <CabinetLoginView
        locale={locale}
        auth={auth}
        initialError={session.state === "guest" ? session.error : null}
        onLinked={(linked) => setSession({ state: "linked", linked })}
      />
    );
  }

  return (
    <CabinetSessionProvider value={value}>
      <CabinetChrome locale={locale}>{children}</CabinetChrome>
    </CabinetSessionProvider>
  );
}
