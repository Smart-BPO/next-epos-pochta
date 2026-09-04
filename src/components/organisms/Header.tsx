"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath, switchLocalePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/cn";
import { pageContainer } from "@/styles/ui";

interface HeaderProps {
  locale: Locale;
  content: SiteCopy;
}

export function Header({ locale, content }: HeaderProps) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const requestHref = localePath(locale, "/request-price/");
  const phoneHref = `tel:${SITE_CONFIG.phone}`;

  return (
    <header className="sticky top-0 z-40 border-b border-border/90 bg-white/90 backdrop-blur-md">
      <div
        className={cn(
          pageContainer,
          "flex min-h-[var(--header-height)] items-center justify-between gap-4",
        )}
      >
        <Link
          href={localePath(locale, "/")}
          className="whitespace-nowrap font-display text-[1.05rem] font-extrabold tracking-wide text-primary"
        >
          {SITE_CONFIG.name}
        </Link>

        <nav className="hidden items-center gap-5 md:flex" aria-label="Main">
          {content.nav.map((item) => (
            <Link
              key={item.href}
              href={localePath(locale, item.href)}
              className="text-[0.95rem] text-ink hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div
            className="inline-flex overflow-hidden rounded-[0.55rem] border border-border"
            aria-label="Language"
          >
            <Link
              href={switchLocalePath(pathname, "uz")}
              aria-current={locale === "uz" ? "true" : undefined}
              className={cn(
                "grid min-h-[var(--tap-min)] min-w-10 place-items-center px-2.5 text-[0.8rem] font-semibold",
                locale === "uz" && "bg-primary text-white",
              )}
            >
              UZ
            </Link>
            <Link
              href={switchLocalePath(pathname, "ru")}
              aria-current={locale === "ru" ? "true" : undefined}
              className={cn(
                "grid min-h-[var(--tap-min)] min-w-10 place-items-center px-2.5 text-[0.8rem] font-semibold",
                locale === "ru" && "bg-primary text-white",
              )}
            >
              RU
            </Link>
          </div>
          <a
            className="hidden whitespace-nowrap font-semibold md:inline"
            href={phoneHref}
          >
            {SITE_CONFIG.phoneDisplay}
          </a>
          <span className="hidden md:inline">
            <Button href={requestHref}>{content.ui.requestPrice}</Button>
          </span>
          <button
            type="button"
            className="inline-flex min-h-[var(--tap-min)] min-w-[var(--tap-min)] items-center justify-center rounded-sm border border-border bg-white md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? content.ui.close : content.ui.menu}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-border bg-white px-[var(--page-padding)] pb-5 pt-4 md:hidden",
          !open && "hidden",
        )}
      >
        {content.nav.map((item) => (
          <Link
            key={item.href}
            href={localePath(locale, item.href)}
            onClick={() => setOpen(false)}
            className="flex min-h-[var(--tap-min)] items-center border-b border-border py-1"
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-4 grid gap-3">
          <a href={phoneHref}>{SITE_CONFIG.phoneDisplay}</a>
          <Button href={requestHref}>{content.ui.requestPrice}</Button>
        </div>
      </div>
    </header>
  );
}
