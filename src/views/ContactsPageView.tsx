import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { ContactForm } from "@/components/organisms/ContactForm";
import { PageCta } from "@/components/organisms/PageCta";
import { SITE_CONFIG } from "@/utils/consts";
import {
  heroActions,
  homeSectionTitle,
  mapPlaceholder,
  pageIntro,
  pageIntroTitle,
  sectionLead,
  sectionMuted,
  sectionTitle,
} from "@/styles/ui";

export function ContactsPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const mapLat = process.env.NEXT_PUBLIC_MAP_LAT;
  const mapLng = process.env.NEXT_PUBLIC_MAP_LNG;
  const hasMap = Boolean(mapLat && mapLng);
  const hours = SITE_CONFIG.hours.trim();
  const email = SITE_CONFIG.email.trim();

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

  return (
    <>
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{copy.contacts.title}</h1>
          <p className={sectionLead}>{copy.contacts.lead}</p>
          <div className={heroActions}>
            <Button href={`tel:${SITE_CONFIG.phone}`}>{copy.ui.call}</Button>
            <Button href={SITE_CONFIG.telegramUrl} variant="secondary">
              {copy.ui.write}
            </Button>
          </div>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div className="flex flex-col gap-8">
            <div>
              <h2 className={homeSectionTitle}>{copy.contacts.channelsTitle}</h2>
              <div className="mt-6 flex flex-col gap-5">
                <div>
                  <p className="m-0 text-sm font-semibold uppercase tracking-wide text-black/40">
                    {copy.ui.call}
                  </p>
                  <a
                    href={`tel:${SITE_CONFIG.phone}`}
                    className="mt-1 block text-2xl font-semibold text-black hover:text-primary"
                  >
                    {SITE_CONFIG.phoneDisplay}
                  </a>
                </div>

                <div>
                  <p className="m-0 text-sm font-semibold uppercase tracking-wide text-black/40">
                    Telegram
                  </p>
                  <a
                    href={SITE_CONFIG.telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-lg font-medium text-primary hover:underline"
                  >
                    {copy.contacts.telegramLabel}
                  </a>
                </div>

                {email ? (
                  <div>
                    <p className="m-0 text-sm font-semibold uppercase tracking-wide text-black/40">
                      Email
                    </p>
                    <a
                      href={`mailto:${email}`}
                      className="mt-1 block break-all text-lg font-medium text-black hover:text-primary"
                    >
                      {email}
                    </a>
                  </div>
                ) : null}

                {hours ? (
                  <div>
                    <p className="m-0 text-sm font-semibold uppercase tracking-wide text-black/40">
                      {locale === "uz" ? "Ish vaqti" : "Режим работы"}
                    </p>
                    <p className="mt-1 m-0 text-lg text-black/70">{hours}</p>
                  </div>
                ) : null}

                <div>
                  <p className="m-0 text-sm font-semibold uppercase tracking-wide text-black/40">
                    {copy.contacts.addressTitle}
                  </p>
                  <p className="mt-1 m-0 text-base leading-relaxed text-black/70">
                    {SITE_CONFIG.address.line}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="m-0 mb-3 text-sm font-semibold uppercase tracking-wide text-black/40">
                {copy.contacts.socialTitle}
              </p>
              <div className="flex flex-wrap gap-4">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="relative size-12 shrink-0 overflow-hidden rounded-full border border-black/10 bg-white"
                  >
                    <Image
                      src={social.src}
                      alt=""
                      fill
                      unoptimized
                      className="object-contain p-2"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className={sectionTitle}>{copy.contacts.formTitle}</h2>
            <ContactForm locale={locale} content={copy} />
          </div>
        </PageContainer>
      </section>

      <section className="relative isolate overflow-hidden py-[var(--section-y)]">
        {!hasMap ? (
          <Image
            src="/images/hero/uzbekistan-map.svg"
            alt=""
            width={1000}
            height={652}
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[min(100%,40rem)] max-w-[min(100%,46rem)] select-none object-contain object-right opacity-90 md:block"
            unoptimized
          />
        ) : null}
        <PageContainer className="relative z-10 flex flex-col gap-6 md:gap-9">
          <div className="max-w-xl">
            <h2 className={homeSectionTitle}>{copy.contacts.addressTitle}</h2>
            <p className="mt-3 m-0 text-[length:var(--home-lead)] text-black/60">
              {SITE_CONFIG.address.line}
            </p>
            <p className={sectionLead}>{copy.contacts.mapNote}</p>
          </div>
          {hasMap ? (
            <iframe
              title={copy.contacts.addressTitle}
              className={`${mapPlaceholder} min-h-[20rem] w-full border-0`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapLng) - 0.02}%2C${Number(mapLat) - 0.01}%2C${Number(mapLng) + 0.02}%2C${Number(mapLat) + 0.01}&layer=mapnik&marker=${mapLat}%2C${mapLng}`}
            />
          ) : (
            <div className="relative min-h-[14rem] overflow-hidden rounded-3xl border border-black/20 bg-white p-[var(--card-pad)] md:hidden">
              <Image
                src="/images/hero/uzbekistan-map.svg"
                alt=""
                width={600}
                height={400}
                className="mx-auto h-auto w-full max-w-sm object-contain opacity-90"
                unoptimized
              />
            </div>
          )}
        </PageContainer>
      </section>

      <PageCta locale={locale} content={copy} />
    </>
  );
}
