import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { PageCta } from "@/components/organisms/PageCta";
import { cn } from "@/lib/cn";
import {
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
          <div className={`${alertInfo} rounded-2xl`}>{copy.services.priceNote}</div>
        </PageContainer>
      </section>

      {copy.services.items.map((service, index) => (
        <section
          key={service.id}
          className={cn(index % 2 ? sectionMuted : section, anchorSection)}
          id={service.id}
        >
          <PageContainer>
            <article className="grid gap-6 rounded-3xl border border-black/20 bg-white p-[var(--card-pad)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="min-w-0">
                <h2 className={sectionTitle}>{service.title}</h2>
                <div className="grid gap-4 text-base text-black/70">
                  <p className="m-0">
                    <strong className="font-semibold text-black">
                      {locale === "uz" ? "Kimlar uchun:" : "Для кого:"}
                    </strong>{" "}
                    {service.audience}
                  </p>
                  <p className="m-0">
                    <strong className="font-semibold text-black">
                      {locale === "uz" ? "Qanday ishlaydi:" : "Как работает:"}
                    </strong>{" "}
                    {service.howItWorks}
                  </p>
                  <div>
                    <strong className="font-semibold text-black">
                      {locale === "uz" ? "Nima kiradi:" : "Что входит:"}
                    </strong>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {service.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="m-0">
                    <strong className="font-semibold text-black">
                      {locale === "uz"
                        ? "Qanday joʻnatmalar:"
                        : "Какие отправления:"}
                    </strong>{" "}
                    {service.accepted}
                  </p>
                  <p className="m-0">
                    <strong className="font-semibold text-black">
                      {locale === "uz"
                        ? "Hisob uchun kerak:"
                        : "Данные для расчёта:"}
                    </strong>{" "}
                    {service.neededForQuote}
                  </p>
                  <p className="m-0">
                    <strong className="font-semibold text-black">
                      {locale === "uz" ? "Cheklovlar:" : "Ограничения:"}
                    </strong>{" "}
                    {service.limitations}
                  </p>
                </div>
                {service.faqs.length ? (
                  <div className="mt-6 border-t border-black/10 pt-4">
                    {service.faqs.map((faq) => (
                      <details key={faq.question} className={faqDetails}>
                        <summary className={faqSummary}>{faq.question}</summary>
                        <p className="text-black/60">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                ) : null}
              </div>
              <Button
                href={`${localePath(locale, "/request-price/")}?service=${service.id}`}
                className="w-full lg:w-auto lg:self-start"
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
