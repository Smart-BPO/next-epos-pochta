"use client";

import Link from "next/link";
import type { AdminUser } from "@/lib/cms/auth-shared";
import { canAccess } from "@/lib/cms/auth-shared";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { useDashLocale } from "@/components/dashboard/DashLocaleProvider";
import { DASHBOARD_NAV } from "@/components/dashboard/nav";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashTopBar } from "@/components/dashboard/chrome/DashTopBar";
import { DashMobileNav } from "@/components/dashboard/mobile/DashMobileNav";
import type { DashNotificationsSnapshot } from "@/lib/cms/notifications";
import {
  dashAside,
  dashMainColumn,
  dashMainMobilePad,
  dashShell,
} from "@/styles/dashboard";
import { cn } from "@/lib/cn";
import { SITE_CONFIG } from "@/utils/consts";

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
  const items = DASHBOARD_NAV.filter((item) => canAccess(admin.role, item.area));

  return (
    <div className={dashShell}>
      <div className="flex h-dvh w-full">
        <aside className={dashAside}>
          <div className="flex h-14 shrink-0 items-center border-b border-black/[0.06] px-5">
            <Link
              href="/dashboard/"
              className="inline-flex h-8 w-[84px] items-center"
              aria-label={SITE_CONFIG.name}
            >
              <BrandLogo locale={locale} priority />
            </Link>
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
