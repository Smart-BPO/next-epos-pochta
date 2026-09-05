import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { PageCta } from "@/components/organisms/PageCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { getServiceCatalogSchema } from "@/utils/seo/json-ld";
import { cn } from "@/lib/cn";
import {
  anchorSection,
  faqDetails,
  faqSummary,
  homeSectionTitle,
  pageIntro,
  pageIntroTitle,
  section,
  sectionLead,
  sectionMuted,
  sectionTitle,
} from "@/styles/ui";

const SERVICE_MEDIA: Record<string, string> = {
  documents: "/images/services/01-document-delivery.webp",
  parcels: "/images/services/02-parcel-delivery.webp",
  door: "/images/services/03-door-delivery.webp",
  courier: "/images/services/04-courier-call.webp",
  ecommerce: "/images/services/05-ecommerce-delivery.webp",
  corporate: "/images/services/06-corporate-delivery.webp",
  cod: "/images/services/07-cash-on-delivery.webp",
  returns: "/images/services/08-return-shipments.webp",
};

function serviceHref(locale: Locale, serviceId: string): {
  href: string;
  isB2b: boolean;
} {
  const b2bIds = new Set(["ecommerce", "corporate", "cod", "returns"]);
  if (b2bIds.has(serviceId)) {
    const base = localePath(locale, "/request-price/");
    return { href: `${base}?service=${serviceId}`, isB2b: true };
  }

  const category =
    serviceId === "documents"
      ? "documents"
      : serviceId === "parcels"
        ? "parcel"
        : serviceId === "door"
          ? "parcel"
          : "";
  const base = localePath(locale, "/calculator/");
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (serviceId === "courier") params.set("pickup", "1");
  const qs = params.toString();
  return {
    href: `${base}${qs ? `?${qs}` : ""}`,
    isB2b: false,
  };
}

export function ServicesPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const labels = {
    audience: locale === "uz" ? "Kimlar uchun" : "Для кого",
    how: locale === "uz" ? "Qanday ishlaydi" : "Как работает",
    includes: locale === "uz" ? "Nima kiradi" : "Что входит",
    accepted: locale === "uz" ? "Qanday joʻnatmalar" : "Какие отправления",
    quote: locale === "uz" ? "Hisob uchun kerak" : "Данные для расчёта",
    limits: locale === "uz" ? "Cheklovlar" : "Ограничения",
    catalog: locale === "uz" ? "Xizmatlar katalogi" : "Каталог услуг",
  };

  return (
    <>
      <JsonLd
        data={getServiceCatalogSchema(locale, copy.services.items)}
      />
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{copy.meta.servicesTitle}</h1>
          <p className={sectionLead}>{copy.services.intro}</p>
        </PageContainer>
      </section>

      <section className="bg-gradient-to-b from-primary to-primary-hover py-[var(--section-y)]">
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={`${homeSectionTitle} text-white`}>{labels.catalog}</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {copy.services.items.map((service) => {
              const src =
                SERVICE_MEDIA[service.id] ??
                "/images/services/02-parcel-delivery.webp";
              return (
                <a
                  key={service.id}
                  href={`#${service.id}`}
                  className="flex h-full flex-col gap-2.5 rounded-2xl border border-black/20 bg-white p-3 transition-transform hover:-translate-y-0.5 sm:gap-4 sm:rounded-3xl sm:p-[var(--card-pad)]"
                >
                  <h3 className="m-0 min-h-[2.5em] font-display text-[0.8125rem] font-semibold uppercase leading-tight text-black sm:text-xl md:text-2xl">
                    {service.title}
                  </h3>
                  <div className="relative h-[6.5rem] w-full shrink-0 overflow-hidden sm:h-[12.5rem]">
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-contain object-center p-1 sm:p-2"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <p className="m-0 flex-1 text-xs leading-snug text-black/60 sm:text-base">
                    {service.audience}
                  </p>
                </a>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {copy.services.items.map((service, index) => {
        const src =
          SERVICE_MEDIA[service.id] ??
          "/images/services/02-parcel-delivery.webp";
        const action = serviceHref(locale, service.id);
        return (
          <section
            key={service.id}
            className={cn(index % 2 ? sectionMuted : section, anchorSection)}
            id={service.id}
          >
            <PageContainer>
              <article className="grid gap-8 rounded-3xl border border-black/20 bg-white p-[var(--card-pad)] lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
                <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-3xl bg-surface-muted lg:mx-0">
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-contain p-5"
                    sizes="16rem"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className={sectionTitle}>{service.title}</h2>
                  <div className="grid gap-4 text-base text-black/70">
                    <p className="m-0">
                      <strong className="font-semibold text-black">
                        {labels.audience}:
                      </strong>{" "}
                      {service.audience}
                    </p>
                    <p className="m-0">
                      <strong className="font-semibold text-black">
                        {labels.how}:
                      </strong>{" "}
                      {service.howItWorks}
                    </p>
                    <div>
                      <strong className="font-semibold text-black">
                        {labels.includes}:
                      </strong>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {service.includes.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="m-0">
                      <strong className="font-semibold text-black">
                        {labels.accepted}:
                      </strong>{" "}
                      {service.accepted}
                    </p>
                    <p className="m-0">
                      <strong className="font-semibold text-black">
                        {labels.quote}:
                      </strong>{" "}
                      {service.neededForQuote}
                    </p>
                    <p className="m-0">
                      <strong className="font-semibold text-black">
                        {labels.limits}:
                      </strong>{" "}
                      {service.limitations}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href={action.href}>
                      {action.isB2b
                        ? copy.ui.requestPrice
                        : copy.ui.calculate}
                    </Button>
                    <Button
                      href={localePath(locale, "/contacts/")}
                      variant="secondary"
                    >
                      {copy.ui.write}
                    </Button>
                  </div>

                  {service.faqs.length > 0 ? (
                    <div className="mt-8 border-t border-border pt-4">
                      {service.faqs.map((faq) => (
                        <details key={faq.question} className={faqDetails}>
                          <summary className={faqSummary}>
                            {faq.question}
                          </summary>
                          <p className="text-black/60">{faq.answer}</p>
                        </details>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            </PageContainer>
          </section>
        );
      })}

      <PageCta locale={locale} content={copy} />
    </>
  );
}
