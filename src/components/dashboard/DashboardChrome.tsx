"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { AdminUser } from "@/lib/cms/auth-shared";
import { canAccess } from "@/lib/cms/auth-shared";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { useDashLocale, useDashT } from "@/components/dashboard/DashLocaleProvider";
import { DASHBOARD_NAV } from "@/components/dashboard/nav";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashTopBar } from "@/components/dashboard/chrome/DashTopBar";
import { DashMobileNav } from "@/components/dashboard/mobile/DashMobileNav";
import { DashIconButton } from "@/components/dashboard/ds/DashIconButton";
import type { DashNotificationsSnapshot } from "@/lib/cms/notifications";
import {
  dashAside,
  dashMainColumn,
  dashMainMobilePad,
  dashShell,
} from "@/styles/dashboard";
import { cn } from "@/lib/cn";
import { SITE_CONFIG } from "@/utils/consts";

const COLLAPSE_KEY = "dash-sidebar-collapsed";
const COLLAPSE_EVENT = "dash-sidebar-collapsed-change";

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

export function DashboardChrome({
  admin,
  notifications,
  children,
}: {
  admin: AdminUser;
  notifications: DashNotificationsSnapshot;
  children: React.ReactNode;
}) {
  const { locale } = useDashLocale();
  const t = useDashT();
  const items = DASHBOARD_NAV.filter((item) => canAccess(admin.role, item.area));
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
    <div className={dashShell}>
      <div className="flex h-dvh w-full">
        <aside
          className={dashAside}
          data-collapsed={collapsed ? "true" : "false"}
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--dash-border)] px-3">
            <Link
              href="/dashboard/"
              className={cn(
                "inline-flex h-8 items-center overflow-hidden",
                collapsed ? "w-8 justify-center" : "w-[84px]",
              )}
              aria-label={SITE_CONFIG.name}
            >
              <BrandLogo locale={locale} priority />
            </Link>
            <DashIconButton
              label={
                collapsed ? t.common.expandSidebar : t.common.collapseSidebar
              }
              onClick={toggleCollapsed}
              className="hidden lg:inline-flex"
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" strokeWidth={1.75} />
              ) : (
                <PanelLeftClose className="size-4" strokeWidth={1.75} />
              )}
            </DashIconButton>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2 pb-4">
            <DashboardNav
              items={items}
              collapsed={collapsed}
              badges={{
                leads: notifications.showLeadsLink
                  ? notifications.badge
                  : 0,
              }}
            />
          </div>
        </aside>

        <div className={dashMainColumn}>
          <DashTopBar admin={admin} notifications={notifications} />
          <main className={cn("min-w-0 p-4 sm:p-5 lg:p-6", dashMainMobilePad)}>
            {children}
          </main>
          <DashMobileNav admin={admin} items={items} />
        </div>
      </div>
    </div>
  );
}
