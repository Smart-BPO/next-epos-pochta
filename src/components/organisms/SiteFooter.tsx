import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { SITE_CONFIG } from "@/utils/consts";
import { cn } from "@/lib/cn";
import { pageContainer } from "@/styles/ui";

interface SiteFooterProps {
  locale: Locale;
  content: SiteCopy;
}

export function SiteFooter({ locale, content }: SiteFooterProps) {
  return (
    <footer className="mt-auto bg-surface-deep py-12 text-[#f3f3f3]">
      <div
        className={cn(
          pageContainer,
          "grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-8",
        )}
      >
        <div>
          <div className="mb-3 whitespace-nowrap font-display text-[1.05rem] font-extrabold tracking-wide text-[#ffb3ba]">
            {SITE_CONFIG.name}
          </div>
          <p className="text-[0.9rem] text-[#bdbdbd]">{content.footer.blurb}</p>
        </div>

        <div>
          <strong>{content.footer.contacts}</strong>
          <ul className="mt-3 list-none p-0">
            {content.nav.map((item) => (
              <li key={item.href} className="mb-1.5">
                <Link
                  href={localePath(locale, item.href)}
                  className="text-[#f3f3f3] hover:text-[#ffb3ba]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p>
            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className="text-[#f3f3f3] hover:text-[#ffb3ba]"
            >
              {SITE_CONFIG.phoneDisplay}
            </a>
          </p>
          <p className="text-[0.9rem] text-[#bdbdbd]">
            {SITE_CONFIG.email || content.ui.placeholderEmail}
          </p>
          <p className="text-[0.9rem] text-[#bdbdbd]">
            {SITE_CONFIG.telegramUrl ? (
              <a
                href={SITE_CONFIG.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#f3f3f3] hover:text-[#ffb3ba]"
              >
                Telegram
              </a>
            ) : (
              content.ui.placeholderTelegram
            )}
          </p>
          <p className="text-[0.9rem] text-[#bdbdbd]">
            {SITE_CONFIG.hours || content.ui.placeholderHours}
          </p>
          <p className="text-[0.9rem] text-[#bdbdbd]">
            {SITE_CONFIG.address.line}
          </p>
        </div>
      </div>

      <div
        className={cn(
          pageContainer,
          "mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#333] pt-5",
        )}
      >
        <p className="m-0 text-[0.9rem] text-[#bdbdbd]">{content.footer.legal}</p>
        <div className="flex flex-wrap gap-4">
          <Link
            href={localePath(locale, "/privacy/")}
            className="text-[#f3f3f3] hover:text-[#ffb3ba]"
          >
            {content.footer.privacy}
          </Link>
          <Link
            href={localePath(locale, "/terms/")}
            className="text-[#f3f3f3] hover:text-[#ffb3ba]"
          >
            {content.footer.terms}
          </Link>
        </div>
      </div>
    </footer>
  );
}
