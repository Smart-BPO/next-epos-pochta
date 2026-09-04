import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { PageCta } from "@/components/organisms/PageCta";
import { cn } from "@/lib/cn";
import {
  actionTile,
  alertInfo,
  anchorSection,
  faqDetails,
  faqSummary,
  pageIntro,
  pageIntroTitle,
  section,
  sectionLead,
  sectionMuted,
  sectionTitle,
} from "@/styles/ui";

export function ServicesPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{copy.meta.servicesTitle}</h1>
          <p className={sectionLead}>{copy.services.intro}</p>
          <div className={alertInfo}>{copy.services.priceNote}</div>
        </PageContainer>
      </section>

      {copy.services.items.map((service, index) => (
        <section
          key={service.id}
          className={cn(
            index % 2 ? sectionMuted : section,
            anchorSection,
          )}
          id={service.id}
        >
          <PageContainer>
            <article className={`${actionTile} border-0 pt-0`}>
              <div>
                <h2 className={sectionTitle}>{service.title}</h2>
                <p>
                  <strong>
                    {locale === "uz" ? "Kimlar uchun:" : "Для кого:"}
                  </strong>{" "}
                  {service.audience}
                </p>
                <p>
                  <strong>
                    {locale === "uz" ? "Qanday ishlaydi:" : "Как работает:"}
                  </strong>{" "}
                  {service.howItWorks}
                </p>
                <p>
                  <strong>
                    {locale === "uz" ? "Nima kiradi:" : "Что входит:"}
                  </strong>
                </p>
                <ul>
                  {service.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>
                  <strong>
                    {locale === "uz"
                      ? "Qanday joʻnatmalar:"
                      : "Какие отправления:"}
                  </strong>{" "}
                  {service.accepted}
                </p>
                <p>
                  <strong>
                    {locale === "uz"
                      ? "Hisob uchun kerak:"
                      : "Данные для расчёта:"}
                  </strong>{" "}
                  {service.neededForQuote}
                </p>
                <p>
                  <strong>
                    {locale === "uz" ? "Cheklovlar:" : "Ограничения:"}
                  </strong>{" "}
                  {service.limitations}
                </p>
                {service.faqs.length ? (
                  <div className="mt-4">
                    {service.faqs.map((faq) => (
                      <details key={faq.question} className={faqDetails}>
                        <summary className={faqSummary}>{faq.question}</summary>
                        <p className="text-ink-muted">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                ) : null}
              </div>
              <Button
                href={`${localePath(locale, "/request-price/")}?service=${service.id}`}
              >
                {copy.ui.requestPrice}
              </Button>
            </article>
          </PageContainer>
        </section>
      ))}

      <PageCta locale={locale} content={copy} />
    </>
  );
}
