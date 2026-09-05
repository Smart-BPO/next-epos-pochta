import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { PageCta } from "@/components/organisms/PageCta";
import { SITE_CONFIG } from "@/utils/consts";
import {
  btnSecondary,
  heroActions,
  homeSectionTitle,
  pageIntro,
  pageIntroTitle,
  sectionLead,
  sectionMuted,
} from "@/styles/ui";
import { cn } from "@/lib/cn";

function officeMapEmbedSrc(lat: number, lng: number) {
  const ll = `${lng},${lat}`;
  return `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(ll)}&z=16&pt=${encodeURIComponent(`${ll},pm2rdm`)}&l=map`;
}

function officeMapsExternalUrl(lat: number, lng: number) {
  return `https://yandex.ru/maps/?pt=${lng},${lat}&z=16&l=map`;
}

export function ContactsPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const { lat, lng, line } = SITE_CONFIG.address;
  const hours = SITE_CONFIG.hours.trim();
  const email = SITE_CONFIG.email.trim();
  const mapsUrl = officeMapsExternalUrl(lat, lng);

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
        <PageContainer className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
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
                    {line}
                  </p>
                  <p className="mt-2 m-0 text-sm text-black/50">
                    {copy.contacts.mapNote}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(btnSecondary, "mt-4 inline-flex")}
                  >
                    {copy.contacts.openInMaps}
                  </a>
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

          <div className="overflow-hidden rounded-3xl border border-black/15 bg-white shadow-[0_1px_0_rgb(0_0_0/0.04)]">
            <iframe
              title={copy.contacts.addressTitle}
              className="block h-[min(70vh,32rem)] min-h-[22rem] w-full border-0 lg:min-h-[28rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              src={officeMapEmbedSrc(lat, lng)}
            />
          </div>
        </PageContainer>
      </section>

      <PageCta locale={locale} content={copy} />
    </>
  );
}
