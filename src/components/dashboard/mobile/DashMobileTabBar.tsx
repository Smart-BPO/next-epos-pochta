"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import type { DashboardNavItem } from "@/components/dashboard/nav";
import { resolveNavLabel } from "@/components/dashboard/DashboardNav";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
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

function TabLabel({ children }: { children: string }) {
  return (
    <span className="max-w-full truncate px-0.5 text-center text-[0.6875rem] font-semibold leading-tight tracking-[-0.01em]">
      {children}
    </span>
  );
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
  const t = useDashT();

  if (!isClient) return null;

  return createPortal(
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
      }}
      aria-label={t.common.moreMenu}
    >
      <div
        className="pointer-events-auto mx-auto grid h-[var(--dash-tabbar-h)] w-[min(100%-1.5rem,28rem)] grid-flow-col overflow-hidden rounded-[1.35rem] border border-black/[0.08] bg-white/95 shadow-[0_8px_32px_rgb(15_18_24/0.14),0_2px_8px_rgb(15_18_24/0.06)] backdrop-blur-xl"
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
                "relative flex min-w-0 flex-col items-center justify-center gap-1 px-1.5 py-2 transition-colors",
                active ? "text-primary" : "text-black/45 active:text-black/70",
              )}
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-2xl transition-colors",
                  active
                    ? "bg-primary-soft text-primary shadow-[inset_0_0_0_1px_rgb(211_2_3/0.12)]"
                    : "bg-transparent text-black/40",
                )}
              >
                <DashNavIcon href={item.href} className="size-6" />
              </span>
              <TabLabel>{resolveNavLabel(item, t.nav, true)}</TabLabel>
              {active ? (
                <span
                  className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary/80"
                  aria-hidden
                />
              ) : null}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          className={cn(
            "relative flex min-w-0 flex-col items-center justify-center gap-1 px-1.5 py-2 transition-colors",
            moreActive ? "text-primary" : "text-black/45 active:text-black/70",
          )}
          aria-expanded={moreActive}
          aria-haspopup="dialog"
        >
          <span
            className={cn(
              "grid size-10 place-items-center rounded-2xl transition-colors",
              moreActive
                ? "bg-primary-soft text-primary shadow-[inset_0_0_0_1px_rgb(211_2_3/0.12)]"
                : "bg-transparent text-black/40",
            )}
          >
            <IconMore className="size-6" />
          </span>
          <TabLabel>{t.common.moreMenu}</TabLabel>
          {moreActive ? (
            <span
              className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary/80"
              aria-hidden
            />
          ) : null}
        </button>
      </div>
    </nav>,
    document.body,
  );
}
