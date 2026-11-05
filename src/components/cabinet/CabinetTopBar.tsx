"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { cabinetCopy } from "@/data/cabinet";
import { cabinetHref } from "@/components/cabinet/nav";
import { useCabinetSession } from "@/components/cabinet/CabinetSession";
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
  const { linked } = useCabinetSession();
  const c = cabinetCopy(locale);
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const value = q.trim();
    if (!value) return;
    router.push(
      `${cabinetHref(locale, "tracking/")}?number=${encodeURIComponent(value)}`,
    );
  };

  return (
    <header className={cabTopBar}>
      <Link
        href={cabinetHref(locale)}
        className="inline-flex h-7 shrink-0 items-center lg:hidden"
        aria-label={SITE_CONFIG.name}
      >
        <BrandLogo locale={locale} priority />
      </Link>

      <form onSubmit={onSearch} className="relative hidden min-w-0 flex-1 md:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/35"
          aria-hidden
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={c.searchPlaceholder}
          aria-label={c.searchPlaceholder}
          className="h-9 w-full max-w-md rounded-lg border border-black/10 bg-white py-0 pl-9 pr-3 text-sm text-ink outline-none focus:border-black/25"
        />
      </form>

      <div className="ml-auto flex items-center gap-3">
        <nav className="hidden items-center gap-2 text-xs sm:flex" aria-label="Language">
          {LOCALES.map((code) => (
            <Link
              key={code}
              href={localePath(code, barePath(pathname))}
              className={cn(
                "uppercase no-underline",
                locale === code
                  ? "font-semibold text-ink"
                  : "text-black/40 hover:text-ink",
              )}
            >
              {code}
            </Link>
          ))}
        </nav>
        <Link
          href={cabinetHref(locale, "settings/")}
          className="max-w-[10rem] truncate text-sm text-ink no-underline hover:text-primary"
        >
          {linked.displayName || linked.phone}
        </Link>
      </div>
    </header>
  );
}
