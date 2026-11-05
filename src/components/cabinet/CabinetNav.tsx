"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
  ClipboardList,
  Home,
  MapPinned,
  PackagePlus,
  PieChart,
  RotateCcw,
  Wallet,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { cabinetCopy } from "@/data/cabinet";
import {
  cabinetHref,
  getCabinetNav,
  isCabinetNavActive,
  type CabinetNavId,
} from "@/components/cabinet/nav";
import { useCabinetData } from "@/components/cabinet/CabinetData";
import { cn } from "@/lib/cn";

const ICONS: Partial<Record<CabinetNavId, typeof Home>> = {
  home: Home,
  orders: ClipboardList,
  returns: RotateCcw,
  calculator: Calculator,
  finance: Wallet,
  reports: PieChart,
  tracking: MapPinned,
  new: PackagePlus,
};

export function CabinetNav({
  locale,
  collapsed,
}: {
  locale: Locale;
  collapsed?: boolean;
}) {
  const pathname = usePathname() || cabinetHref(locale);
  const items = getCabinetNav(locale);
  const stats = useCabinetData();
  const c = cabinetCopy(locale);

  const badges: Record<string, number> = {
    orders: stats.total,
    returns: stats.returns,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-2 pb-2">
        <Link
          href={cabinetHref(locale, "new/")}
          title={c.navNew}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white no-underline transition hover:bg-primary-hover",
            collapsed ? "size-10 w-full" : "h-10 w-full",
          )}
        >
          <PackagePlus className="size-4" aria-hidden />
          {!collapsed ? c.navNew : null}
        </Link>
      </div>

      <nav className="flex flex-col gap-0.5 px-2" aria-label="Cabinet">
        {items.map((item) => {
          const active = isCabinetNavActive(pathname, item, locale);
          const Icon = ICONS[item.id] ?? Home;
          const badge = item.badgeKey ? badges[item.badgeKey] : 0;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
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
              <span
                className={cn(
                  "relative",
                  active ? "text-primary" : "text-[var(--dash-faint)]",
                )}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                {collapsed && badge > 0 ? (
                  <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-primary" />
                ) : null}
              </span>
              {!collapsed ? (
                <>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {badge > 0 ? (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
