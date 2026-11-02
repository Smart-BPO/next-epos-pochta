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
  collapsed,
  badge,
}: {
  item: DashboardNavItem;
  active: boolean;
  variant: "side" | "mobile";
  collapsed?: boolean;
  badge?: number;
}) {
  const label = useNavLabel(item, variant === "mobile");
  const showBadge = typeof badge === "number" && badge > 0;

  if (variant === "mobile") {
    return (
      <Link
        href={item.href}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
          active
            ? "border-primary/25 bg-primary-soft text-primary"
            : "border-[var(--dash-border-strong)] bg-[var(--dash-surface)] text-[var(--dash-muted-strong)]",
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
      title={label}
      aria-label={label}
      className={cn(
        "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed && "justify-center px-2",
        active
          ? "bg-primary-soft text-primary"
          : "text-[var(--dash-muted-strong)] hover:bg-black/[0.03] hover:text-[var(--dash-ink)]",
      )}
    >
      {active && !collapsed ? (
        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-primary" />
      ) : null}
      <span className={cn("relative", active ? "text-primary" : "text-[var(--dash-faint)]")}>
        <DashNavIcon href={item.href} />
        {collapsed && showBadge ? (
          <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-primary" />
        ) : null}
      </span>
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {showBadge ? (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
              {badge > 99 ? "99+" : badge}
            </span>
          ) : null}
        </>
      ) : null}
    </Link>
  );
}

export function DashboardNav({
  items,
  variant = "side",
  collapsed = false,
  badges,
}: {
  items: DashboardNavItem[];
  variant?: "side" | "mobile";
  collapsed?: boolean;
  badges?: Partial<Record<DashboardNavItem["labelKey"], number>>;
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
            {!collapsed ? (
              <p className="m-0 mb-1 px-3 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--dash-faint)]">
                {t.nav.groups[groupId]}
              </p>
            ) : null}
            <div className="flex flex-col gap-0.5">
              {groupItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href)}
                  variant="side"
                  collapsed={collapsed}
                  badge={badges?.[item.labelKey]}
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
