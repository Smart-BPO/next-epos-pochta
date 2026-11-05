"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { CabinetNav } from "@/components/cabinet/CabinetNav";
import { CabinetTopBar } from "@/components/cabinet/CabinetTopBar";
import { CabinetMobileNav } from "@/components/cabinet/CabinetMobileNav";
import { useCabinetSession } from "@/components/cabinet/CabinetSession";
import { cabinetHref } from "@/components/cabinet/nav";
import { cabinetCopy } from "@/data/cabinet";
import {
  cabAside,
  cabMainColumn,
  cabMainMobilePad,
  cabShell,
} from "@/styles/cabinet";
import { cn } from "@/lib/cn";
import { SITE_CONFIG } from "@/utils/consts";

const COLLAPSE_KEY = "cab-sidebar-collapsed";
const COLLAPSE_EVENT = "cab-sidebar-collapsed-change";

function subscribeCollapsed(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === COLLAPSE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(COLLAPSE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(COLLAPSE_EVENT, onStoreChange);
  };
}

function readCollapsed() {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function CabinetChrome({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const { linked, total } = useCabinetSession();
  const c = cabinetCopy(locale);
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    readCollapsed,
    () => false,
  );

  const toggleCollapsed = useCallback(() => {
    try {
      window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "0" : "1");
      window.dispatchEvent(new Event(COLLAPSE_EVENT));
    } catch {
      // ignore
    }
  }, [collapsed]);

  const initials = (() => {
    const name = linked.displayName?.trim();
    if (name) {
      return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]!.toUpperCase())
        .join("");
    }
    return linked.phone.replace(/\D/g, "").slice(-2);
  })();

  return (
    <div className={cabShell}>
      <div className="flex h-dvh w-full">
        <aside
          className={cabAside}
          data-collapsed={collapsed ? "true" : "false"}
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--dash-border)] px-3">
            <Link
              href={cabinetHref(locale)}
              className={cn(
                "inline-flex h-8 items-center overflow-hidden",
                collapsed ? "w-8 justify-center" : "w-[84px]",
              )}
              aria-label={SITE_CONFIG.name}
            >
              <BrandLogo locale={locale} priority />
            </Link>
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden size-9 items-center justify-center rounded-xl text-[var(--dash-muted)] transition hover:bg-black/[0.04] hover:text-ink lg:inline-flex"
              aria-label={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" strokeWidth={1.75} />
              ) : (
                <PanelLeftClose className="size-4" strokeWidth={1.75} />
              )}
            </button>
          </div>

          {!collapsed ? (
            <div className="mx-2 mt-3 rounded-2xl border border-[var(--dash-border)] bg-black/[0.02] p-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[11px] text-[var(--dash-muted)]">
                    {c.greeting},
                  </p>
                  <p className="m-0 truncate text-sm font-semibold text-[var(--dash-ink)]">
                    {linked.displayName || linked.phone}
                  </p>
                </div>
              </div>
              {total != null ? (
                <div className="mt-3 rounded-xl bg-white px-3 py-2">
                  <p className="m-0 text-[11px] text-[var(--dash-muted)]">
                    {c.statTotal}
                  </p>
                  <p className="m-0 font-display text-xl font-semibold text-[var(--dash-ink)]">
                    {total}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2 pb-4">
            <CabinetNav locale={locale} collapsed={collapsed} />
          </div>
        </aside>

        <div className={cabMainColumn}>
          <CabinetTopBar locale={locale} />
          <main className={cn("min-w-0 p-4 sm:p-5 lg:p-6", cabMainMobilePad)}>
            {children}
          </main>
          <CabinetMobileNav locale={locale} />
        </div>
      </div>
    </div>
  );
}
