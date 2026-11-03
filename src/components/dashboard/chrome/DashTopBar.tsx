"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminUser } from "@/lib/cms/auth-shared";
import type { DashNotificationsSnapshot } from "@/lib/cms/notifications";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { DashHeaderActions } from "@/components/dashboard/chrome/DashHeaderActions";
import { useDashLocale, useDashT } from "@/components/dashboard/DashLocaleProvider";
import { DASHBOARD_NAV } from "@/components/dashboard/nav";
import { DashBreadcrumbs } from "@/components/dashboard/ui";
import { dashTopBar } from "@/styles/dashboard";
import { SITE_CONFIG } from "@/utils/consts";

export function DashTopBar({
  admin,
  notifications,
}: {
  admin: AdminUser;
  notifications: DashNotificationsSnapshot;
}) {
  const t = useDashT();
  const { locale } = useDashLocale();
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
        <Link
          href="/dashboard/"
          className="inline-flex h-7 items-center lg:hidden"
          aria-label={SITE_CONFIG.name}
        >
          <BrandLogo locale={locale} variant="red" width={84} height={28} priority />
        </Link>
        <div className="hidden lg:block">
          <DashBreadcrumbs items={crumbs} />
        </div>
      </div>
      <CommandPalette admin={admin} />
      <DashHeaderActions admin={admin} notifications={notifications} />
    </header>
  );
}
