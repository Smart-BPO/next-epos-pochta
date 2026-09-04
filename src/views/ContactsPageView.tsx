import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { ContactForm } from "@/components/organisms/ContactForm";
import { SITE_CONFIG } from "@/utils/consts";

export function ContactsPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <section className="section">
      <PageContainer>
        <h1 className="section-title">{copy.contacts.title}</h1>
        <p className="section-lead">{copy.contacts.lead}</p>

        <div className="grid-cards" style={{ marginBottom: "2rem" }}>
          <div className="card">
            <h2>{copy.ui.call}</h2>
            <p>
              <a href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phoneDisplay}</a>
            </p>
            <p className="hint">
              {SITE_CONFIG.email || copy.ui.placeholderEmail}
            </p>
            <p className="hint">
              {SITE_CONFIG.telegramUrl
                ? "Telegram"
                : copy.ui.placeholderTelegram}
            </p>
            <p className="hint">
              {SITE_CONFIG.hours || copy.ui.placeholderHours}
            </p>
            <p>{SITE_CONFIG.address.line}</p>
            <div className="hero-actions" style={{ marginTop: "1rem" }}>
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
          </div>
          <div className="card">
            <h2>
              {locale === "uz" ? "Xarita" : "Карта"}
            </h2>
            <p className="hint">{copy.contacts.mapNote}</p>
          </div>
        </div>

        <h2 className="section-title">{copy.contacts.formTitle}</h2>
        <ContactForm locale={locale} content={copy} />
      </PageContainer>
    </section>
  );
}
