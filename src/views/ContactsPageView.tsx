import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { ContactForm } from "@/components/organisms/ContactForm";
import { SITE_CONFIG } from "@/utils/consts";
import {
  heroActions,
  mapPlaceholder,
  pageIntro,
  pageIntroTitle,
  section,
  sectionLead,
  sectionMuted,
  sectionTitle,
} from "@/styles/ui";

export function ContactsPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const mapLat = process.env.NEXT_PUBLIC_MAP_LAT;
  const mapLng = process.env.NEXT_PUBLIC_MAP_LNG;

  const cards = [
    {
      title: copy.ui.call,
      body: (
        <a href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phoneDisplay}</a>
      ),
    },
    {
      title: "Email",
      body: SITE_CONFIG.email || copy.ui.placeholderEmail,
    },
    {
      title: "Telegram",
      body: (
        <a
          href={SITE_CONFIG.telegramUrl}
          target="_blank"
          rel="noreferrer"
          className="break-all"
        >
          {SITE_CONFIG.telegramUrl}
        </a>
      ),
    },
    {
      title: "Instagram",
      body: (
        <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noreferrer">
          @epos_pochta
        </a>
      ),
    },
    {
      title: "Facebook",
      body: (
        <a href={SITE_CONFIG.facebookUrl} target="_blank" rel="noreferrer">
          EPOS POCHTA
        </a>
      ),
    },
    {
      title: locale === "uz" ? "Ish vaqti" : "Режим работы",
      body: SITE_CONFIG.hours || copy.ui.placeholderHours,
    },
    {
      title: locale === "uz" ? "Manzil" : "Адрес",
      body: SITE_CONFIG.address.line,
    },
  ];

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
            <Button
              href={localePath(locale, "/request-price/")}
              variant="secondary"
            >
              {copy.ui.requestPrice}
            </Button>
          </div>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <article
                key={card.title}
                className="rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]"
              >
                <h3 className="m-0 mb-2 text-lg font-semibold text-black">
                  {card.title}
                </h3>
                <p className="m-0 min-w-0 break-words text-sm text-black/60">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer>
          <h2 className={sectionTitle}>
            {locale === "uz" ? "Xarita" : "Карта"}
          </h2>
          <p className={sectionLead}>{copy.contacts.mapNote}</p>
          {mapLat && mapLng ? (
            <iframe
              title={locale === "uz" ? "Xarita" : "Карта"}
              className={`${mapPlaceholder} w-full border-0`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapLng) - 0.02}%2C${Number(mapLat) - 0.01}%2C${Number(mapLng) + 0.02}%2C${Number(mapLat) + 0.01}&layer=mapnik&marker=${mapLat}%2C${mapLng}`}
            />
          ) : (
            <div className={mapPlaceholder}>
              <p>
                {locale === "uz"
                  ? "Xarita koordinatalari env orqali ulanadi"
                  : "Координаты карты подключатся через env"}
              </p>
            </div>
          )}
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.contacts.formTitle}</h2>
          <ContactForm locale={locale} content={copy} />
        </PageContainer>
      </section>
    </>
  );
}
