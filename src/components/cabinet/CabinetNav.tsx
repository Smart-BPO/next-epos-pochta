"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
  CircleHelp,
  ClipboardList,
  Home,
  LogOut,
  MapPinned,
  PackagePlus,
  PieChart,
  RotateCcw,
  Settings,
  Wallet,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { accountCopy } from "@/data/account-copy";
import { cabinetCopy } from "@/data/cabinet";
import {
  cabinetHref,
  getCabinetNav,
  isCabinetNavActive,
  type CabinetNavId,
} from "@/components/cabinet/nav";
import { useCabinetSession } from "@/components/cabinet/CabinetSession";
import { useCabinetData } from "@/components/cabinet/CabinetData";
import { SITE_CONFIG } from "@/utils/consts";
import { cn } from "@/lib/cn";

const ICONS: Record<CabinetNavId, typeof Home> = {
  home: Home,
  orders: ClipboardList,
  returns: RotateCcw,
  calculator: Calculator,
  finance: Wallet,
  reports: PieChart,
  tracking: MapPinned,
  settings: Settings,
  help: CircleHelp,
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
  const { logout, loggingOut } = useCabinetSession();
  const stats = useCabinetData();
  const a = accountCopy(locale);
  const c = cabinetCopy(locale);

  const badges: Record<string, number> = {
    orders: stats.total,
    returns: stats.returns,
    attention: stats.attention.length,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!collapsed ? (
        <div className="px-2 pb-2">
          <Link
            href={cabinetHref(locale, "new/")}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgb(211_2_3/0.22)] transition hover:bg-primary-hover"
          >
            <PackagePlus className="size-4" aria-hidden />
            {c.navNew}
          </Link>
        </div>
      ) : (
        <div className="px-2 pb-2">
          <Link
            href={cabinetHref(locale, "new/")}
            title={c.navNew}
            className="inline-flex size-10 w-full items-center justify-center rounded-xl bg-primary text-white"
          >
            <PackagePlus className="size-4" aria-hidden />
          </Link>
        </div>
      )}

      <nav className="flex flex-col gap-0.5 px-2" aria-label="Cabinet">
        {items.map((item) => {
          const active = isCabinetNavActive(pathname, item, locale);
          const Icon = ICONS[item.id];
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
              <Icon
                className={cn(
                  "size-[18px] shrink-0",
                  active ? "text-primary" : "text-[var(--dash-faint)]",
                )}
                aria-hidden
              />
              {!collapsed ? (
                <>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {badge && badge > 0 ? (
                    <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[0.65rem] font-bold text-[var(--dash-muted-strong)]">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </>
              ) : null}
            </Link>
          );
        })}
        <button
          type="button"
          disabled={loggingOut}
          title={a.logout}
          aria-label={a.logout}
          onClick={() => void logout()}
          className={cn(
            "mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--dash-muted)] transition hover:bg-black/[0.03] hover:text-primary disabled:opacity-50",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="size-[18px] shrink-0" aria-hidden />
          {!collapsed ? <span>{a.logout}</span> : null}
        </button>
      </nav>

      {!collapsed ? (
        <div className="mt-auto px-2 pb-3 pt-4">
          <div className="rounded-2xl bg-ink p-3 text-white">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
              {c.managerTitle}
            </p>
            <p className="m-0 mt-1 text-sm font-semibold">EPOS POCHTA</p>
            <p className="m-0 mt-0.5 text-xs text-white/55">{c.managerHours}</p>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <a
                href={`tel:${SITE_CONFIG.phone}`}
                className="inline-flex h-8 items-center justify-center rounded-lg bg-white/10 text-[11px] font-semibold text-white no-underline hover:bg-white/15"
              >
                {c.managerCall}
              </a>
              <a
                href={SITE_CONFIG.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center justify-center rounded-lg bg-primary text-[11px] font-semibold text-white no-underline hover:bg-primary-hover"
              >
                {c.managerTelegram}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
