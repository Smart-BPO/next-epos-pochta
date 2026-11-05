"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { accountCopy } from "@/data/account-copy";
import { cabinetCopy } from "@/data/cabinet";
import {
  cabinetHref,
  getCabinetNav,
  isCabinetNavActive,
} from "@/components/cabinet/nav";
import { useCabinetSession } from "@/components/cabinet/CabinetSession";
import { useCabinetData } from "@/components/cabinet/CabinetData";
import { cabTopBar } from "@/styles/cabinet";
import { SITE_CONFIG } from "@/utils/consts";
import { cn } from "@/lib/cn";

const LOCALES: Locale[] = ["uz", "ru", "zh"];

function barePath(pathname: string): string {
  const stripped = pathname.replace(/^\/(ru|zh)(?=\/|$)/, "");
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

export function CabinetTopBar({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/cabinet/";
  const router = useRouter();
  const { linked, logout, loggingOut } = useCabinetSession();
  const stats = useCabinetData();
  const c = cabinetCopy(locale);
  const a = accountCopy(locale);
  const [q, setQ] = useState("");
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

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const value = q.trim();
    if (!value) return;
    if (/^PKG/i.test(value) || value.length >= 8) {
      router.push(
        `${cabinetHref(locale, "tracking/")}?number=${encodeURIComponent(value)}`,
      );
      return;
    }
    router.push(
      `${cabinetHref(locale, "orders/")}?q=${encodeURIComponent(value)}`,
    );
  };

  return (
    <header className={cabTopBar}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link
          href={cabinetHref(locale)}
          className="inline-flex h-7 shrink-0 items-center lg:hidden"
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
        <div className="hidden shrink-0 lg:block">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dash-faint)]">
            {c.brandTag}
          </p>
          <p className="m-0 text-sm font-semibold text-ink">{current.label}</p>
        </div>
        <form
          onSubmit={onSearch}
          className="relative hidden min-w-0 flex-1 md:block"
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/35"
            aria-hidden
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={c.searchPlaceholder}
            className="h-10 w-full max-w-xl rounded-xl border border-black/10 bg-white py-0 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
        </form>
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

        <Link
          href={cabinetHref(locale, "orders/")}
          className="relative inline-flex size-9 items-center justify-center rounded-xl border border-black/10 bg-white text-black/55 transition hover:text-ink"
          aria-label={c.attentionTitle}
        >
          <Bell className="size-4" aria-hidden />
          {stats.attention.length > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
              {stats.attention.length}
            </span>
          ) : null}
        </Link>

        <Link
          href={cabinetHref(locale, "settings/")}
          className="hidden items-center gap-2 rounded-xl border border-black/10 bg-white py-1 pl-1 pr-2.5 no-underline sm:inline-flex"
        >
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-white">
            {initials}
          </span>
          <span className="max-w-[9rem] truncate text-xs font-semibold text-ink">
            {linked.displayName || linked.phone}
          </span>
        </Link>

        <button
          type="button"
          disabled={loggingOut}
          onClick={() => void logout()}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-black/10 bg-white px-2.5 text-xs font-semibold text-black/55 transition hover:bg-black/[0.03] hover:text-primary disabled:opacity-50"
          aria-label={a.logout}
        >
          <LogOut className="size-3.5" aria-hidden />
        </button>
      </div>
    </header>
  );
}
