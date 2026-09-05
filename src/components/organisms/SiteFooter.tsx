import Image from "next/image";
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

const supportEmail = SITE_CONFIG.email || "support@epos.uz";

const supportLinkClass =
  "inline-flex min-w-0 items-start gap-2 text-sm text-black hover:text-primary";

function SupportIcon({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={24}
      height={24}
      unoptimized
      className="mt-0.5 shrink-0"
    />
  );
}

export function SiteFooter({ locale, content }: SiteFooterProps) {
  const socials = [
    {
      href: SITE_CONFIG.telegramUrl,
      src: "/images/brand/social/telegram.svg",
      label: "Telegram",
    },
    {
      href: SITE_CONFIG.instagramUrl,
      src: "/images/brand/social/instagram.svg",
      label: "Instagram",
    },
    {
      href: SITE_CONFIG.facebookUrl,
      src: "/images/brand/social/facebook.svg",
      label: "Facebook",
    },
  ] as const;

  const address =
    locale === "uz" ? SITE_CONFIG.address.lineUz : SITE_CONFIG.address.line;
  const hours =
    locale === "uz"
      ? SITE_CONFIG.hoursDisplayUz
      : SITE_CONFIG.hoursDisplayRu;

  return (
    <footer className="mt-auto border-t border-black/10 bg-white py-10 text-black md:py-14">
      <div className={cn(pageContainer, "flex flex-col gap-10 md:gap-12")}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div className="flex flex-col gap-8 sm:col-span-2 lg:col-span-1">
            <div className="flex flex-col gap-4">
              <Link href={localePath(locale, "/")} className="inline-block w-[92px]">
                <Image
                  src="/images/brand/logo.svg"
                  alt={SITE_CONFIG.name}
                  width={92}
                  height={36}
                  unoptimized
                />
              </Link>
              <p className="m-0 max-w-sm text-sm leading-5 text-black/60">
                {content.footer.blurb}
              </p>
            </div>
            <div className="flex flex-wrap gap-6 sm:gap-8">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="relative size-12 shrink-0 overflow-hidden"
                >
                  <Image src={social.src} alt="" fill unoptimized className="object-contain" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <p className="m-0 text-xl font-medium text-black sm:text-2xl">
              {content.footer.contacts}
            </p>
            <nav className="flex flex-col">
              {content.nav.map((item) => (
                <Link
                  key={item.href}
                  href={localePath(locale, item.href)}
                  className="rounded-full py-2 text-sm font-medium text-black hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <p className="m-0 text-xl font-medium text-black sm:text-2xl">
              {content.footer.support}
            </p>

            <Link href={localePath(locale, "/faq/")} className={supportLinkClass}>
              <SupportIcon src="/images/brand/icon-faq.svg" />
              <span className="min-w-0 break-words">{content.footer.faqLink}</span>
            </Link>

            <Link
              href={localePath(locale, "/calculator/")}
              className={cn(supportLinkClass, "font-medium")}
            >
              <SupportIcon src="/images/brand/icon-calculator.svg" />
              <span className="min-w-0 break-words">{content.ui.calculator}</span>
            </Link>

            <Link
              href={localePath(locale, "/delivery/")}
              className={cn(supportLinkClass, "font-medium")}
            >
              <SupportIcon src="/images/brand/icon-cities.svg" />
              <span className="min-w-0 break-words">
                {content.footer.geography}
              </span>
            </Link>

            <a href={`mailto:${supportEmail}`} className={supportLinkClass}>
              <SupportIcon src="/images/brand/icon-mail.svg" />
              <span className="min-w-0 break-all">{supportEmail}</span>
            </a>

            <a
              href={SITE_CONFIG.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className={supportLinkClass}
            >
              <SupportIcon src="/images/brand/icon-telegram.svg" />
              <span>Telegram</span>
            </a>

            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className="inline-flex min-w-0 items-center gap-2 text-xl font-medium text-black hover:text-primary sm:text-2xl"
            >
              <SupportIcon src="/images/brand/icon-phone.svg" />
              <span className="min-w-0 break-all">{SITE_CONFIG.phoneDisplay}</span>
            </a>

            <p className={cn(supportLinkClass, "m-0 cursor-default hover:text-black")}>
              <SupportIcon src="/images/brand/icon-pin.svg" />
              <span className="min-w-0 break-words leading-5">{address}</span>
            </p>

            <p
              className={cn(
                supportLinkClass,
                "m-0 cursor-default text-black/60 hover:text-black/60",
              )}
            >
              <SupportIcon src="/images/brand/icon-clock.svg" />
              <span className="min-w-0">{hours}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-black/10 pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <p className="m-0 text-sm text-black/60">{content.footer.legal}</p>
          <div className="flex flex-wrap gap-4 sm:gap-8 sm:justify-end">
            <Link
              href={localePath(locale, "/privacy/")}
              className="text-sm font-medium text-black/60 hover:text-primary"
            >
              {content.footer.privacy}
            </Link>
            <Link
              href={localePath(locale, "/terms/")}
              className="text-sm font-medium text-black/60 hover:text-primary"
            >
              {content.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
