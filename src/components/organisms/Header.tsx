"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { cn } from "@/lib/cn";
import { pageContainer } from "@/styles/ui";

interface HeaderProps {
  locale: Locale;
  content: SiteCopy;
}

export function Header({ locale, content }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const requestHref = localePath(locale, "/request-price/");
  const phoneHref = `tel:${SITE_CONFIG.phone}`;

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-md">
      <div
        className={cn(
          pageContainer,
          "flex min-h-[var(--header-height)] items-center justify-between gap-3",
        )}
      >
        <Link
          href={localePath(locale, "/")}
          className="relative h-9 w-[92px] shrink-0"
          aria-label={SITE_CONFIG.name}
        >
          <Image
            src="/images/brand/logo.svg"
            alt={SITE_CONFIG.name}
            width={92}
            height={36}
            className="h-9 w-auto"
            priority
            unoptimized
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {content.nav.map((item) => (
            <Link
              key={item.href}
              href={localePath(locale, item.href)}
              className="rounded-xl px-3 py-4 text-base font-medium text-black/60 hover:text-black xl:px-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            className="hidden whitespace-nowrap rounded-xl px-3 py-4 text-base font-medium text-black xl:inline"
            href={phoneHref}
          >
            {SITE_CONFIG.phoneDisplay}
          </a>
          <LanguageSwitcher locale={locale} />
          <span className="hidden md:inline">
            <Button href={requestHref}>{content.ui.requestPrice}</Button>
          </span>
          <button
            type="button"
            className="inline-flex min-h-[var(--tap-min)] min-w-[var(--tap-min)] items-center justify-center rounded-xl border border-black/10 bg-white px-3 lg:hidden"
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
          "border-t border-black/5 bg-white px-[var(--page-padding)] pb-5 pt-4 lg:hidden",
          !open && "hidden",
        )}
      >
        {content.nav.map((item) => (
          <Link
            key={item.href}
            href={localePath(locale, item.href)}
            onClick={() => setOpen(false)}
            className="flex min-h-[var(--tap-min)] items-center border-b border-black/5 py-1 text-black/60"
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-4 grid gap-3">
          <a href={phoneHref} className="font-medium text-black">
            {SITE_CONFIG.phoneDisplay}
          </a>
          <Button href={requestHref}>{content.ui.requestPrice}</Button>
        </div>
      </div>
    </header>
  );
}
