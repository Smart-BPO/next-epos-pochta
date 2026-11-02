"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import type { AdminUser } from "@/lib/cms/auth-shared";
import type { DashNotificationsSnapshot } from "@/lib/cms/notifications";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { DashHeaderActions } from "@/components/dashboard/chrome/DashHeaderActions";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { DASHBOARD_NAV } from "@/components/dashboard/nav";
import { DashBreadcrumbs } from "@/components/dashboard/ui";
import { dashTopBar } from "@/styles/dashboard";
import { cn } from "@/lib/cn";

export function DashTopBar({
  admin,
  notifications,
}: {
  admin: AdminUser;
  notifications: DashNotificationsSnapshot;
}) {
  const t = useDashT();
  const pathname = usePathname() || "/dashboard/";

  const crumbs = useMemo(() => {
    const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
    const match = [...DASHBOARD_NAV]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) =>
        item.href === "/dashboard/"
          ? path === "/dashboard/"
          : path === item.href || path.startsWith(item.href),
      );
    const items: Array<{ href?: string; label: string }> = [
      { href: "/dashboard/", label: t.common.breadcrumbsHome },
    ];
    if (match && match.href !== "/dashboard/") {
      items.push({ label: t.nav[match.labelKey] });
    }
    return items;
  }, [pathname, t]);

  return (
    <header className={dashTopBar}>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "m-0 truncate font-display text-sm font-bold text-primary lg:hidden",
          )}
        >
          {t.brand}
        </p>
        <div className="hidden lg:block">
          <DashBreadcrumbs items={crumbs} />
        </div>
      </div>
      <CommandPalette admin={admin} />
      <DashHeaderActions admin={admin} notifications={notifications} />
    </header>
  );
}
