"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { accountCopy } from "@/data/account-copy";
import { cabinetCopy } from "@/data/cabinet";
import {
  getCabinetNav,
  isCabinetNavActive,
} from "@/components/cabinet/nav";
import { useCabinetSession } from "@/components/cabinet/CabinetSession";
import { cabTopBar } from "@/styles/cabinet";
import { SITE_CONFIG } from "@/utils/consts";
import { cn } from "@/lib/cn";

const LOCALES: Locale[] = ["uz", "ru", "zh"];

/** Strip locale prefix so we can re-prefix for the language switcher. */
function barePath(pathname: string): string {
  const stripped = pathname.replace(/^\/(ru|zh)(?=\/|$)/, "");
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

export function CabinetTopBar({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/cabinet/";
  const { linked, logout, loggingOut, total } = useCabinetSession();
  const c = cabinetCopy(locale);
  const a = accountCopy(locale);
  const items = getCabinetNav(locale);
  const current =
    items.find((item) => isCabinetNavActive(pathname, item, locale)) ??
    items[0]!;

  const initials = (() => {
    const name = linked.displayName?.trim();
    if (name) {
      return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]!.toUpperCase())
        .join("");
    }
    return linked.phone.replace(/\D/g, "").slice(-2);
  })();

  return (
    <header className={cabTopBar}>
      <div className="min-w-0 flex-1">
        <Link
          href={localePath(locale, "/cabinet/")}
          className="inline-flex h-7 items-center lg:hidden"
          aria-label={SITE_CONFIG.name}
        >
          <BrandLogo
            locale={locale}
            variant="red"
            width={84}
            height={28}
            priority
          />
        </Link>
        <div className="hidden min-w-0 lg:block">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--dash-faint)]">
            {c.title}
          </p>
          <p className="m-0 truncate text-sm font-semibold text-[var(--dash-ink)]">
            {current.label}
            {total != null && current.id === "shipments" ? (
              <span className="ml-2 font-normal text-[var(--dash-muted)]">
                · {total}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className="hidden items-center gap-0.5 rounded-xl border border-black/10 bg-white p-0.5 sm:inline-flex"
          role="group"
          aria-label="Language"
        >
          {LOCALES.map((code) => (
            <Link
              key={code}
              href={localePath(code, barePath(pathname))}
              className={cn(
                "rounded-lg px-2 py-1 text-[0.7rem] font-bold uppercase transition",
                locale === code
                  ? "bg-primary-soft text-primary"
                  : "text-black/45 hover:text-ink",
              )}
            >
              {code}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-black/10 bg-white py-1 pl-1 pr-2.5 sm:inline-flex">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-white">
            {initials}
          </span>
          <span className="max-w-[9rem] truncate text-xs font-semibold text-ink">
            {linked.displayName || linked.phone}
          </span>
        </div>

        <button
          type="button"
          disabled={loggingOut}
          onClick={() => void logout()}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-black/10 bg-white px-2.5 text-xs font-semibold text-black/55 transition hover:bg-black/[0.03] hover:text-primary disabled:opacity-50"
          aria-label={a.logout}
        >
          <LogOut className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">{a.logout}</span>
        </button>
      </div>
    </header>
  );
}
