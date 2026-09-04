import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { ContactForm } from "@/components/organisms/ContactForm";
import { SITE_CONFIG } from "@/utils/consts";
import {
  featureItem,
  featureItemText,
  featureItemTitle,
  featureList,
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

  return (
    <>
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{copy.contacts.title}</h1>
          <p className={sectionLead}>{copy.contacts.lead}</p>
          <div className={heroActions}>
            <Button href={`tel:${SITE_CONFIG.phone}`}>{copy.ui.call}</Button>
            {SITE_CONFIG.telegramUrl ? (
              <Button href={SITE_CONFIG.telegramUrl} variant="secondary">
                {copy.ui.write}
              </Button>
            ) : null}
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
          <ul className={featureList}>
            <li className={featureItem}>
              <h3 className={featureItemTitle}>{copy.ui.call}</h3>
              <p className={featureItemText}>
                <a href={`tel:${SITE_CONFIG.phone}`}>
                  {SITE_CONFIG.phoneDisplay}
                </a>
              </p>
            </li>
            <li className={featureItem}>
              <h3 className={featureItemTitle}>Email</h3>
              <p className={featureItemText}>
                {SITE_CONFIG.email || copy.ui.placeholderEmail}
              </p>
            </li>
            <li className={featureItem}>
              <h3 className={featureItemTitle}>Telegram</h3>
              <p className={featureItemText}>
                {SITE_CONFIG.telegramUrl
                  ? SITE_CONFIG.telegramUrl
                  : copy.ui.placeholderTelegram}
              </p>
            </li>
            <li className={featureItem}>
              <h3 className={featureItemTitle}>
                {locale === "uz" ? "Ish vaqti" : "Режим работы"}
              </h3>
              <p className={featureItemText}>
                {SITE_CONFIG.hours || copy.ui.placeholderHours}
              </p>
            </li>
            <li className={featureItem}>
              <h3 className={featureItemTitle}>
                {locale === "uz" ? "Manzil" : "Адрес"}
              </h3>
              <p className={featureItemText}>{SITE_CONFIG.address.line}</p>
            </li>
          </ul>
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
