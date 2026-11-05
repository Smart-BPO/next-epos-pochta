"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { CabinetBrandLogo } from "@/components/cabinet/CabinetBrandLogo";
import { CabinetNav } from "@/components/cabinet/CabinetNav";
import { CabinetTopBar } from "@/components/cabinet/CabinetTopBar";
import { CabinetMobileNav } from "@/components/cabinet/CabinetMobileNav";
import { CabinetDataProvider } from "@/components/cabinet/CabinetData";
import { cabinetHref } from "@/components/cabinet/nav";
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

  return (
    <CabinetDataProvider locale={locale}>
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
                <CabinetBrandLogo locale={locale} priority />
              </Link>
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden size-9 shrink-0 items-center justify-center rounded-xl text-[var(--dash-muted)] transition hover:bg-black/[0.04] hover:text-ink lg:inline-flex"
                aria-label={collapsed ? "Expand" : "Collapse"}
              >
                {collapsed ? (
                  <PanelLeftOpen className="size-4" strokeWidth={1.75} />
                ) : (
                  <PanelLeftClose className="size-4" strokeWidth={1.75} />
                )}
              </button>
            </div>

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
    </CabinetDataProvider>
  );
}
