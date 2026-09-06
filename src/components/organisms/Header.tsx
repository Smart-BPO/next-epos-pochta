"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath, stripLocalePrefix } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { cn } from "@/lib/cn";
import {
  headerControlIcon,
  headerControlQuiet,
  pageContainer,
} from "@/styles/ui";

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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="text-black"
    >
      {open ? (
        <path
          d="M5 5 15 15M15 5 5 15"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M3.5 6h13M3.5 10h13M3.5 14h13"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function Header({ locale, content }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const { path: currentPath } = stripLocalePrefix(pathname);
  const requestHref = localePath(locale, "/calculator/");
  const trackHref = localePath(locale, "/tracking/");
  const menuLabel = open ? content.ui.close : content.ui.menu;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-md">
        <div
          className={cn(
            pageContainer,
            "grid h-[var(--header-height)] grid-cols-[auto_1fr_auto] items-center gap-3 lg:gap-5",
          )}
        >
          <Link
            href={localePath(locale, "/")}
            className="relative z-10 flex h-8 w-[84px] shrink-0 items-center sm:h-9 sm:w-[92px]"
            aria-label={SITE_CONFIG.name}
          >
            <Image
              src="/images/brand/logo.svg"
              alt={SITE_CONFIG.name}
              width={92}
              height={36}
              className="h-full w-auto"
              priority
              unoptimized
            />
          </Link>

          <nav
            className="hidden min-w-0 items-center justify-center lg:flex"
            aria-label="Main"
          >
            <div className="flex items-center justify-center gap-0.5 xl:gap-1">
              {content.nav.map((item) => {
                const active = isActivePath(currentPath, item.href);
                return (
                  <Link
                    key={item.href}
                    href={localePath(locale, item.href)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "whitespace-nowrap rounded-full font-medium transition-colors",
                      "px-2.5 py-1.5 text-[0.8125rem] xl:px-3.5 xl:py-2 xl:text-sm",
                      active
                        ? "bg-black/[0.05] text-black"
                        : "text-black/55 hover:bg-black/[0.03] hover:text-black",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="min-w-0 lg:hidden" aria-hidden />

          <div className="flex items-center justify-end gap-1.5">
            <Link
              href={trackHref}
              className={cn(headerControlQuiet, "hidden whitespace-nowrap lg:inline-flex")}
            >
              {content.ui.track}
            </Link>

            <LanguageSwitcher locale={locale} size="compact" />

            <Button
              href={requestHref}
              size="xs"
              className="!hidden lg:!inline-flex"
            >
              {content.ui.calculate}
            </Button>

            <button
              type="button"
              className={cn(headerControlIcon, "lg:hidden")}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={menuLabel}
              onClick={() => setOpen((v) => !v)}
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </div>
      </header>

      {/* Sibling of header — backdrop-filter on header would collapse a nested fixed panel */}
      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-x-0 bottom-0 top-[var(--header-height)] z-50 overflow-y-auto bg-white lg:hidden",
          !open && "hidden",
        )}
      >
        <div className="mx-auto flex w-[min(calc(100%-2*var(--page-padding)),var(--page-max))] flex-col gap-6 py-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <nav aria-label="Main" className="flex flex-col">
            {content.nav.map((item) => {
              const active = isActivePath(currentPath, item.href);
              return (
                <Link
                  key={item.href}
                  href={localePath(locale, item.href)}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center border-b border-black/5 text-base font-medium",
                    active ? "text-black" : "text-black/60",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="grid gap-2.5">
            <Button
              href={trackHref}
              variant="secondary"
              width="full"
              onClick={() => setOpen(false)}
            >
              {content.ui.track}
            </Button>
            <Button
              href={requestHref}
              width="full"
              onClick={() => setOpen(false)}
            >
              {content.ui.calculate}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
