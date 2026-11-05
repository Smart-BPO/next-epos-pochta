"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { cabinetCopy } from "@/data/cabinet";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { CabinetHeaderActions } from "@/components/cabinet/CabinetHeaderActions";
import {
  cabinetHref,
  getCabinetNav,
  isCabinetNavActive,
} from "@/components/cabinet/nav";
import { cabTopBar } from "@/styles/cabinet";
import { SITE_CONFIG } from "@/utils/consts";

export function CabinetTopBar({ locale }: { locale: Locale }) {
  const pathname = usePathname() || cabinetHref(locale);
  const searchParams = useSearchParams();
  const dir = searchParams.get("dir");
  const router = useRouter();
  const c = cabinetCopy(locale);
  const [q, setQ] = useState("");

  const crumbs = useMemo(() => {
    const items: Array<{ href?: string; label: string }> = [
      { href: cabinetHref(locale), label: c.navHome },
    ];
    const match = getCabinetNav(locale).find((item) =>
      isCabinetNavActive(pathname, item, locale, dir),
    );
    if (match && match.id !== "home") {
      items.push({ label: match.label });
    } else if (pathname.includes("/shipments/")) {
      items.push({ label: c.navOutgoing });
    } else if (pathname.includes("/settings")) {
      items.push({ label: c.navSettings });
    } else if (pathname.includes("/help")) {
      items.push({ label: c.navHelp });
    } else if (pathname.includes("/new")) {
      items.push({ label: c.navNew });
    }
    return items;
  }, [pathname, dir, locale, c]);

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
      <div className="min-w-0 flex-1">
        <Link
          href={cabinetHref(locale)}
          className="inline-flex h-7 items-center lg:hidden"
          aria-label={SITE_CONFIG.name}
        >
          <BrandLogo locale={locale} width={84} height={28} priority />
        </Link>
        <nav
          aria-label="Breadcrumb"
          className="hidden text-sm text-[var(--dash-muted)] lg:block"
        >
          <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
            {crumbs.map((item, i) => (
              <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1.5">
                {i > 0 ? <span className="text-[var(--dash-faint)]">/</span> : null}
                {item.href && i < crumbs.length - 1 ? (
                  <Link
                    href={item.href}
                    className="font-medium text-primary no-underline hover:underline"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-[var(--dash-muted-strong)]">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <form
        onSubmit={onSearch}
        className="relative hidden min-w-0 max-w-xs flex-1 md:block xl:max-w-sm"
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/35"
          aria-hidden
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={c.searchPlaceholder}
          aria-label={c.searchPlaceholder}
          className="h-9 w-full rounded-xl border border-black/10 bg-white py-0 pl-9 pr-3 text-sm text-ink outline-none focus:border-black/25"
        />
      </form>

      <CabinetHeaderActions locale={locale} />
    </header>
  );
}
