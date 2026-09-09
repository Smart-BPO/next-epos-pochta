"use client";

import type { AdminUser } from "@/lib/cms/auth-shared";
import { canAccess } from "@/lib/cms/auth-shared";
import { DASHBOARD_NAV } from "@/components/dashboard/nav";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardToaster } from "@/components/dashboard/DashboardToaster";
import { DashTopBar } from "@/components/dashboard/chrome/DashTopBar";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { DashMobileNav } from "@/components/dashboard/mobile/DashMobileNav";
import type { DashNotificationsSnapshot } from "@/lib/cms/notifications";
import {
  dashAside,
  dashMainColumn,
  dashMainMobilePad,
  dashShell,
} from "@/styles/dashboard";
import { cn } from "@/lib/cn";

export function DashboardChrome({
  admin,
  notifications,
  children,
}: {
  admin: AdminUser;
  notifications: DashNotificationsSnapshot;
  children: React.ReactNode;
}) {
  const t = useDashT();
  const items = DASHBOARD_NAV.filter((item) => canAccess(admin.role, item.area));

  return (
    <div className={dashShell}>
      <DashboardToaster />
      <div className="flex h-dvh w-full">
        <aside className={dashAside}>
          <div className="px-5 pt-5 pb-3">
            <p className="m-0 font-display text-[0.95rem] font-bold tracking-[-0.02em] text-primary">
              {t.brand}
            </p>
            <p className="m-0 mt-0.5 truncate text-xs text-black/40">
              {admin.email}
            </p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2 pb-4">
            <DashboardNav items={items} />
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
