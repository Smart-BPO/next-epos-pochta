"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  NAV_GROUPS,
  type DashboardNavItem,
} from "@/components/dashboard/nav";
import {
  IconLeads,
  IconMap,
  IconMedia,
  IconNews,
  IconOverview,
  IconPackage,
  IconSettings,
  IconStaff,
  IconTelegram,
  IconUsers,
} from "@/components/dashboard/icons";

function IconFor({ href }: { href: string }) {
  if (href === "/dashboard/") return <IconOverview />;
  if (href.startsWith("/dashboard/leads")) return <IconLeads />;
  if (href.includes("/webapp/contacts")) return <IconUsers />;
  if (href.includes("/webapp/shipments")) return <IconPackage />;
  if (href.startsWith("/dashboard/news")) return <IconNews />;
  if (href.startsWith("/dashboard/delivery")) return <IconMap />;
  if (href.includes("/telegram")) return <IconTelegram />;
  if (href.startsWith("/dashboard/settings")) return <IconSettings />;
  if (href.startsWith("/dashboard/media")) return <IconMedia />;
  if (href.startsWith("/dashboard/users")) return <IconStaff />;
  return <IconOverview />;
}

function isActive(pathname: string, href: string) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (href === "/dashboard/") return path === "/dashboard/";
  if (href === "/dashboard/settings/") {
    return path === "/dashboard/settings/" || path === "/dashboard/settings";
  }
  return path === href || path.startsWith(href);
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
        <IconFor href={item.href} />
        {item.label}
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
        <IconFor href={item.href} />
      </span>
      {item.label}
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
      {NAV_GROUPS.map((group) => {
        const groupItems = items.filter((item) => item.group === group.id);
        if (groupItems.length === 0) return null;
        return (
          <div key={group.id}>
            <p className="m-0 mb-1 px-3 text-[0.65rem] font-semibold uppercase tracking-wide text-black/30">
              {group.label}
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
