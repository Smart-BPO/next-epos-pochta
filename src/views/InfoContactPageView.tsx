import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { htmlLang, localeLabels, locales } from "@/i18n/config";
import { infoContactCopy, infoContactLinks } from "@/data/info-contact";
import { localePath } from "@/i18n/paths";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { HtmlLang } from "@/components/atoms/HtmlLang";
import { cn } from "@/lib/cn";

function langHref(code: Locale) {
  return code === "uz" ? "/info/contact/" : `/info/contact/?lang=${code}`;
}

function LinkIcon({ id }: { id: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };
  if (id === "phone") {
    return (
      <svg {...common}>
        <path
          d="M8.5 4.5h2.2l1.1 2.6-1.5 1.1a12.5 12.5 0 0 0 5.5 5.5l1.1-1.5 2.6 1.1v2.2c0 .8-.6 1.5-1.4 1.5A14.5 14.5 0 0 1 4.5 7.4c0-.8.7-1.4 1.5-1.4h2.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (id === "bot") {
    return (
      <svg {...common}>
        <rect
          x="6"
          y="8"
          width="12"
          height="10"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M9 8V6.5a3 3 0 0 1 6 0V8M9.5 12.5h.01M14.5 12.5h.01"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (id === "site") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M4 12h16M12 4c2.2 2.4 3.3 5.1 3.3 8S14.2 17.6 12 20c-2.2-2.4-3.3-5.1-3.3-8S9.8 6.4 12 4Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path
        d="M19.5 6.2 4.8 11.3c-.9.3-.9 1.6.1 1.9l3.7 1.2 1.4 4.3c.3.9 1.5.9 1.9.1l1.6-3.2 4.2 3.1c.7.5 1.7.1 1.9-.8l2.2-10.2c.2-1-.8-1.8-1.7-1.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InfoContactPageView({ locale }: { locale: Locale }) {
  const copy = infoContactCopy(locale);
  const links = infoContactLinks(locale);

  return (
    <main className="flex flex-1 justify-center bg-[var(--color-surface-muted)] px-4 py-8 sm:py-14">
      <HtmlLang lang={htmlLang[locale]} />
      <div className="flex w-full min-w-0 max-w-md flex-col items-center">
        <Link
          href={localePath(locale, "/")}
          className="inline-flex h-10 w-[104px] items-center"
          aria-label="EPOS POCHTA"
        >
          <BrandLogo locale={locale} variant="red" width={104} height={42} priority />
        </Link>
        <h1 className="m-0 mt-5 text-center font-display text-[1.65rem] font-semibold tracking-[-0.03em] text-ink">
          EPOS POCHTA
        </h1>
        <p className="m-0 mt-2 text-center text-sm leading-5 text-black/60">
          {copy.lead}
        </p>
        <p className="m-0 mt-3 text-center text-sm font-medium text-black/80">
          {copy.hours}
        </p>

        <nav
          aria-label={copy.languageLabel}
          className="mt-6 flex rounded-full bg-white p-1 shadow-[var(--shadow-sm)]"
        >
          {locales.map((code) => {
            const active = code === locale;
            return (
              <Link
                key={code}
                href={langHref(code)}
                hrefLang={htmlLang[code]}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex h-9 min-w-12 items-center justify-center rounded-full px-3 text-sm font-semibold",
                  active
                    ? "bg-primary text-white"
                    : "text-black/55 hover:text-black",
                )}
              >
                {localeLabels[code]}
              </Link>
            );
          })}
        </nav>

        <ul className="m-0 mt-6 flex w-full list-none flex-col gap-3 p-0">
          {links.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-3.5 py-3.5 shadow-[var(--shadow-sm)] transition-colors hover:border-primary/30 hover:bg-[var(--color-primary-soft)]"
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full",
                    item.id === "phone" || item.id === "site"
                      ? "bg-primary text-white"
                      : "bg-[var(--color-telegram)] text-white",
                  )}
                >
                  <LinkIcon id={item.id} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-semibold text-ink">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-sm leading-5 text-black/55">
                    {item.description}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
