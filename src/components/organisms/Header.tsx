"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath, stripLocalePrefix } from "@/i18n/paths";
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

function normalizeNavPath(path: string) {
  if (!path || path === "/") return "/";
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

function isActivePath(currentPath: string, href: string) {
  const current = normalizeNavPath(currentPath);
  const target = normalizeNavPath(href);
  if (target === "/") return current === "/";
  return current === target || current.startsWith(target);
}

export function Header({ locale, content }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const { path: currentPath } = stripLocalePrefix(pathname);
  const requestHref = localePath(locale, "/request-price/");
  const trackHref = localePath(locale, "/tracking/");
  const phoneHref = `tel:${SITE_CONFIG.phone}`;
  const menuLabel = locale === "uz" ? "Menyu" : "Меню";
  const actionsLabel = locale === "uz" ? "Amallar" : "Действия";

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
          {content.nav.map((item) => {
            const active = isActivePath(currentPath, item.href);
            return (
              <Link
                key={item.href}
                href={localePath(locale, item.href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-xl px-3 py-4 text-base font-medium xl:px-4",
                  active
                    ? "bg-black/[0.04] text-black"
                    : "text-black/60 hover:text-black",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden lg:inline">
            <Button href={trackHref} variant="secondary">
              {content.ui.track}
            </Button>
          </span>
          <a
            className="hidden whitespace-nowrap rounded-xl px-3 py-4 text-base font-medium text-black lg:inline"
            href={phoneHref}
          >
            {SITE_CONFIG.phoneDisplay}
          </a>
          <span className="hidden sm:inline">
            <LanguageSwitcher locale={locale} />
          </span>
          <Button
            href={requestHref}
            className="!min-h-9 !px-3 !py-2 text-sm lg:!min-h-[var(--tap-min)] lg:!px-6 lg:!py-4 lg:text-base"
          >
            {content.ui.calculate}
          </Button>
          <button
            type="button"
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-black/10 bg-white px-2 text-sm lg:hidden"
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
        <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">
          {menuLabel}
        </p>
        <nav aria-label="Main">
          {content.nav.map((item) => {
            const active = isActivePath(currentPath, item.href);
            return (
              <Link
                key={item.href}
                href={localePath(locale, item.href)}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[var(--tap-min)] items-center border-b border-black/5 py-1",
                  active ? "font-medium text-black" : "text-black/60",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <p className="m-0 mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-black/40">
          {actionsLabel}
        </p>
        <div className="grid gap-3">
          <Button href={trackHref} variant="secondary" onClick={() => setOpen(false)}>
            {content.ui.track}
          </Button>
          <a href={phoneHref} className="font-medium text-black">
            {SITE_CONFIG.phoneDisplay}
          </a>
          <div className="sm:hidden">
            <LanguageSwitcher locale={locale} />
          </div>
          <Button href={requestHref} onClick={() => setOpen(false)}>
            {content.ui.calculate}
          </Button>
        </div>
      </div>
    </header>
  );
}
