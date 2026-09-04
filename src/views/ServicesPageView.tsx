import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { PageCta } from "@/components/organisms/PageCta";

export function ServicesPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <section className="section">
        <PageContainer>
          <h1 className="section-title">{copy.meta.servicesTitle}</h1>
          <p className="section-lead">{copy.services.intro}</p>
          <div className="alert alert-info">{copy.services.priceNote}</div>
        </PageContainer>
      </section>

      {copy.services.items.map((service) => (
        <section key={service.id} className="section section-muted" id={service.id}>
          <PageContainer>
            <article className="card">
              <h2 className="section-title">{service.title}</h2>
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
                <div className="faq" style={{ marginTop: "1rem" }}>
                  {service.faqs.map((faq) => (
                    <details key={faq.question}>
                      <summary>{faq.question}</summary>
                      <p>{faq.answer}</p>
                    </details>
                  ))}
                </div>
              ) : null}
              <div style={{ marginTop: "1.25rem" }}>
                <Button
                  href={`${localePath(locale, "/request-price/")}?service=${service.id}`}
                >
                  {copy.ui.requestPrice}
                </Button>
              </div>
            </article>
          </PageContainer>
        </section>
      ))}

      <PageCta locale={locale} content={copy} />
    </>
  );
}
