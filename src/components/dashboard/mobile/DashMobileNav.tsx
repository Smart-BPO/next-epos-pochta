"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { AdminUser } from "@/lib/cms/auth-shared";
import type { DashboardNavItem } from "@/components/dashboard/nav";
import { DashMobileTabBar } from "@/components/dashboard/mobile/DashMobileTabBar";
import { DashMoreSheet } from "@/components/dashboard/mobile/DashMoreSheet";
import { pickPrimaryTabs } from "@/components/dashboard/mobile/pickPrimaryTabs";

function pathMatches(pathname: string, href: string) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (href === "/dashboard/") return path === "/dashboard/";
  if (href === "/dashboard/settings/") {
    return path === "/dashboard/settings/" || path === "/dashboard/settings";
  }
  return path === href || path.startsWith(href);
}

export function DashMobileNav({
  admin,
  items,
}: {
  admin: AdminUser;
  items: DashboardNavItem[];
}) {
  const pathname = usePathname() || "/dashboard/";
  const [moreOpen, setMoreOpen] = useState(false);
  const { primary, rest } = useMemo(
    () => pickPrimaryTabs(admin.role, items),
    [admin.role, items],
  );

  const restActive = rest.some((item) => pathMatches(pathname, item.href));

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setMoreOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <DashMobileTabBar
        primary={primary}
        moreActive={moreOpen || restActive}
        onMore={() => setMoreOpen((v) => !v)}
      />
      <DashMoreSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        rest={rest}
        admin={admin}
      />
    </>
  );
}
