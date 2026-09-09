"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import type { DashboardNavItem } from "@/components/dashboard/nav";
import { IconMore } from "@/components/dashboard/icons";
import { DashNavIcon } from "@/components/dashboard/mobile/DashNavIcon";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function isActive(pathname: string, href: string) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (href === "/dashboard/") return path === "/dashboard/";
  if (href === "/dashboard/settings/") {
    return path === "/dashboard/settings/" || path === "/dashboard/settings";
  }
  return path === href || path.startsWith(href);
}

export function DashMobileTabBar({
  primary,
  moreActive,
  onMore,
}: {
  primary: DashboardNavItem[];
  moreActive: boolean;
  onMore: () => void;
}) {
  const pathname = usePathname() || "/dashboard/";
  const isClient = useIsClient();

  if (!isClient) return null;

  return createPortal(
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08] bg-white/95 backdrop-blur lg:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        height: "calc(var(--dash-tabbar-h) + env(safe-area-inset-bottom, 0px))",
      }}
      aria-label="Мобильная навигация"
    >
      <div
        className="mx-auto grid h-[var(--dash-tabbar-h)] max-w-lg"
        style={{
          gridTemplateColumns: `repeat(${primary.length + 1}, minmax(0, 1fr))`,
        }}
      >
        {primary.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-[0.65rem] font-semibold",
                active ? "text-primary" : "text-black/40",
              )}
            >
              <span className={cn(active ? "text-primary" : "text-black/35")}>
                <DashNavIcon href={item.href} className="size-5" />
              </span>
              <span className="max-w-full truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          className={cn(
            "flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-[0.65rem] font-semibold",
            moreActive ? "text-primary" : "text-black/40",
          )}
          aria-expanded={moreActive}
          aria-haspopup="dialog"
        >
          <IconMore className="size-5" />
          <span>Ещё</span>
        </button>
      </div>
    </nav>,
    document.body,
  );
}
