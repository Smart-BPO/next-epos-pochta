"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  NAV_GROUP_IDS,
  type DashboardNavItem,
} from "@/components/dashboard/nav";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { DashNavIcon } from "@/components/dashboard/mobile/DashNavIcon";

function isActive(pathname: string, href: string) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (href === "/dashboard/") return path === "/dashboard/";
  if (href === "/dashboard/settings/") {
    return path === "/dashboard/settings/" || path === "/dashboard/settings";
  }
  return path === href || path.startsWith(href);
}

function useNavLabel(item: DashboardNavItem, short = false) {
  const t = useDashT();
  if (short && item.shortLabelKey) {
    return t.nav[item.shortLabelKey];
  }
  return t.nav[item.labelKey];
}

function NavLink({
  item,
  active,
  variant,
}: {
  item: DashboardNavItem;
  active: boolean;
  variant: "side" | "mobile";
}) {
  const label = useNavLabel(item, variant === "mobile");

  if (variant === "mobile") {
    return (
      <Link
        href={item.href}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
          active
            ? "border-primary/25 bg-primary-soft text-primary"
            : "border-black/10 bg-white text-black/65",
        )}
      >
        <DashNavIcon href={item.href} />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary-soft text-primary"
          : "text-black/55 hover:bg-black/[0.03] hover:text-black",
      )}
    >
      {active ? (
        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-primary" />
      ) : null}
      <span className={cn(active ? "text-primary" : "text-black/40")}>
        <DashNavIcon href={item.href} />
      </span>
      {label}
    </Link>
  );
}

export function DashboardNav({
  items,
  variant = "side",
}: {
  items: DashboardNavItem[];
  variant?: "side" | "mobile";
}) {
  const pathname = usePathname() || "/dashboard/";
  const t = useDashT();

  if (variant === "mobile") {
    return (
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            variant="mobile"
          />
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-4 px-2">
      {NAV_GROUP_IDS.map((groupId) => {
        const groupItems = items.filter((item) => item.group === groupId);
        if (groupItems.length === 0) return null;
        return (
          <div key={groupId}>
            <p className="m-0 mb-1 px-3 text-[0.65rem] font-semibold uppercase tracking-wide text-black/30">
              {t.nav.groups[groupId]}
            </p>
            <div className="flex flex-col gap-0.5">
              {groupItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href)}
                  variant="side"
                />
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function resolveNavLabel(
  item: DashboardNavItem,
  nav: ReturnType<typeof useDashT>["nav"],
  short = false,
) {
  if (short && item.shortLabelKey) return nav[item.shortLabelKey];
  return nav[item.labelKey];
}
