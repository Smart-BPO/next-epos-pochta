import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { FaqExplorer } from "@/components/molecules/FaqExplorer";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/utils/consts";
import { getFaqSchema } from "@/utils/seo/json-ld";
import {
  card,
  pageIntro,
  pageIntroTitle,
  section,
  sectionLead,
  sectionMuted,
} from "@/styles/ui";

export function FaqPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const faq = copy.faq;
  const supportEmail = SITE_CONFIG.email || "support@epos.uz";

  const socials = [
    { href: SITE_CONFIG.telegramUrl, label: "Telegram" },
    { href: SITE_CONFIG.instagramUrl, label: "Instagram" },
    { href: SITE_CONFIG.facebookUrl, label: "Facebook" },
  ] as const;

  return (
    <>
      <JsonLd data={getFaqSchema(faq.items)} />

      <section className={pageIntro}>
        <PageContainer className="max-w-4xl">
          <h1 className={pageIntroTitle}>{faq.title}</h1>
          <p className={sectionLead}>{faq.lead}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button href={localePath(locale, "/calculator/")} variant="primary">
              {faq.ctaCalculate}
            </Button>
            <Button href={localePath(locale, "/tracking/")} variant="secondary">
              {faq.ctaTrack}
            </Button>
            <Button
              href={localePath(locale, "/contacts/")}
              variant="secondary"
            >
              {faq.ctaContacts}
            </Button>
          </div>
        </PageContainer>
      </section>

      <section className={`${section} bg-surface-muted/60`}>
        <PageContainer>
          <FaqExplorer faq={faq} />
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <article className={card}>
            <h2 className="m-0 font-display text-2xl font-semibold uppercase tracking-[-0.02em] text-black">
              {faq.supportTitle}
            </h2>
            <p className="mt-3 m-0 text-base text-black/60">{faq.supportLead}</p>
            <dl className="mt-6 m-0 grid gap-4">
              <div>
                <dt className="m-0 text-sm font-semibold text-black/50">
                  {faq.phoneLabel}
                </dt>
                <dd className="mt-1 m-0">
                  <a
                    href={`tel:${SITE_CONFIG.phone}`}
                    className="text-lg font-medium text-black hover:text-primary"
                  >
                    {SITE_CONFIG.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="m-0 text-sm font-semibold text-black/50">
                  {faq.emailLabel}
                </dt>
                <dd className="mt-1 m-0">
                  <a
                    href={`mailto:${supportEmail}`}
                    className="break-all text-base text-black hover:text-primary"
                  >
                    {supportEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="m-0 text-sm font-semibold text-black/50">
                  {faq.addressLabel}
                </dt>
                <dd className="mt-1 m-0 text-base text-black/70">
                  {SITE_CONFIG.address.line}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={localePath(locale, "/calculator/")} variant="primary">
                {faq.ctaCalculate}
              </Button>
              <Button
                href={localePath(locale, "/request-price/")}
                variant="secondary"
              >
                {faq.ctaBusiness}
              </Button>
            </div>
          </article>

          <article className={card}>
            <h2 className="m-0 font-display text-2xl font-semibold uppercase tracking-[-0.02em] text-black">
              {faq.companyTitle}
            </h2>
            <p className="mt-3 m-0 text-base text-black/60">{copy.footer.blurb}</p>

            <h3 className="mt-6 m-0 text-lg font-semibold text-black">
              {faq.contactsTitle}
            </h3>
            <nav className="mt-2 flex flex-col">
              {copy.nav.map((item) => (
                <Link
                  key={item.href}
                  href={localePath(locale, item.href)}
                  className="rounded-full py-2 text-sm font-medium text-black hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <h3 className="mt-6 m-0 text-lg font-semibold text-black">
              {faq.messengersTitle}
            </h3>
            <ul className="mt-2 m-0 flex list-none flex-wrap gap-4 p-0">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 m-0 text-lg font-semibold text-black">
              {faq.legalTitle}
            </h3>
            <p className="mt-2 m-0 text-sm text-black/60">{copy.footer.legal}</p>
            <div className="mt-3 flex flex-wrap gap-4">
              <Link
                href={localePath(locale, "/privacy/")}
                className="text-sm font-medium text-black/60 hover:text-primary"
              >
                {copy.footer.privacy}
              </Link>
              <Link
                href={localePath(locale, "/terms/")}
                className="text-sm font-medium text-black/60 hover:text-primary"
              >
                {copy.footer.terms}
              </Link>
            </div>
            <div className="mt-6">
              <Image
                src="/images/brand/logo.svg"
                alt={SITE_CONFIG.name}
                width={92}
                height={36}
                unoptimized
              />
            </div>
          </article>
        </PageContainer>
      </section>
    </>
  );
}
