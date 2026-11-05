"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  MapPinned,
  Package,
  PackagePlus,
  UserRound,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { accountCopy } from "@/data/account-copy";
import {
  getCabinetNav,
  isCabinetNavActive,
  type CabinetNavId,
} from "@/components/cabinet/nav";
import { useCabinetSession } from "@/components/cabinet/CabinetSession";
import { cn } from "@/lib/cn";

const ICONS: Record<CabinetNavId, typeof Package> = {
  shipments: Package,
  new: PackagePlus,
  tracking: MapPinned,
  profile: UserRound,
};

export function CabinetNav({
  locale,
  collapsed,
}: {
  locale: Locale;
  collapsed?: boolean;
}) {
  const pathname = usePathname() || cabinetFallback(locale);
  const items = getCabinetNav(locale);
  const { logout, loggingOut } = useCabinetSession();
  const a = accountCopy(locale);

  return (
    <nav className="flex flex-col gap-0.5 px-2" aria-label="Cabinet">
      {items.map((item) => {
        const active = isCabinetNavActive(pathname, item, locale);
        const Icon = ICONS[item.id];
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
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
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
          "mt-2 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--dash-muted)] transition hover:bg-black/[0.03] hover:text-primary disabled:opacity-50",
          collapsed && "justify-center px-2",
        )}
      >
        <LogOut className="size-[18px] shrink-0" aria-hidden />
        {!collapsed ? <span>{a.logout}</span> : null}
      </button>
    </nav>
  );
}

function cabinetFallback(locale: Locale) {
  return locale === "uz" ? "/cabinet/" : `/${locale}/cabinet/`;
}
