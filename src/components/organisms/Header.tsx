"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath, switchLocalePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";

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
    <header className="site-header">
      <div className="page-container site-header__inner">
        <Link href={localePath(locale, "/")} className="logo">
          {SITE_CONFIG.name}
        </Link>

        <nav className="site-nav" aria-label="Main">
          {content.nav.map((item) => (
            <Link key={item.href} href={localePath(locale, item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <div className="lang-switch" aria-label="Language">
            <Link
              href={switchLocalePath(pathname, "ru")}
              aria-current={locale === "ru" ? "true" : undefined}
            >
              RU
            </Link>
            <Link
              href={switchLocalePath(pathname, "uz")}
              aria-current={locale === "uz" ? "true" : undefined}
            >
              UZ
            </Link>
          </div>
          <a className="phone-link" href={phoneHref}>
            {SITE_CONFIG.phoneDisplay}
          </a>
          <span className="phone-link">
            <Button href={requestHref}>{content.ui.requestPrice}</Button>
          </span>
          <button
            type="button"
            className="menu-toggle"
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
        className={`mobile-nav ${open ? "is-open" : ""}`}
      >
        {content.nav.map((item) => (
          <Link
            key={item.href}
            href={localePath(locale, item.href)}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
          <a href={phoneHref}>{SITE_CONFIG.phoneDisplay}</a>
          <Button href={requestHref}>{content.ui.requestPrice}</Button>
        </div>
      </div>
    </header>
  );
}
