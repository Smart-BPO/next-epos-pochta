import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import type { ServiceItem } from "@/data/types";
import {
  serviceMetaTitle,
  type ServiceSlug,
} from "@/data/seo/service-landings";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getBreadcrumbSchema,
  getFaqSchema,
  getServiceDetailSchema,
} from "@/utils/seo/json-ld";
import {
  faqDetails,
  faqSummary,
  pageIntro,
  pageIntroTitle,
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

function serviceActionHref(locale: Locale, serviceId: string) {
  const b2bIds = new Set(["ecommerce", "corporate", "cod", "returns"]);
  if (b2bIds.has(serviceId)) {
    return {
      href: `${localePath(locale, "/request-price/")}?service=${serviceId}`,
      isB2b: true,
    };
  }
  const category =
    serviceId === "documents"
      ? "documents"
      : serviceId === "parcels" || serviceId === "door"
        ? "parcel"
        : "";
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (serviceId === "courier") params.set("pickup", "1");
  const qs = params.toString();
  return {
    href: `${localePath(locale, "/calculator/")}${qs ? `?${qs}` : ""}`,
    isB2b: false,
  };
}

export function ServiceDetailPageView({
  locale,
  service,
}: {
  locale: Locale;
  service: ServiceItem;
}) {
  const copy = getContent(locale);
  const slug = service.id as ServiceSlug;
  const h1 = serviceMetaTitle(locale, slug);
  const homePath = localePath(locale, "/");
  const hubPath = localePath(locale, "/services/");
  const thisPath = localePath(locale, `/services/${service.id}/`);
  const src =
    SERVICE_MEDIA[service.id] ?? "/images/services/02-parcel-delivery.webp";
  const action = serviceActionHref(locale, service.id);
  const labels = {
    audience: locale === "uz" ? "Kimlar uchun" : "Для кого",
    how: locale === "uz" ? "Qanday ishlaydi" : "Как работает",
    includes: locale === "uz" ? "Nima kiradi" : "Что входит",
    accepted: locale === "uz" ? "Qanday joʻnatmalar" : "Какие отправления",
    quote: locale === "uz" ? "Hisob uchun kerak" : "Данные для расчёта",
    limits: locale === "uz" ? "Cheklovlar" : "Ограничения",
  };

  const related = copy.services.items.filter((s) => s.id !== service.id);

  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: copy.calculator.breadcrumbHome, path: homePath },
          {
            name: locale === "uz" ? "Xizmatlar" : "Услуги",
            path: hubPath,
          },
          { name: service.title, path: thisPath },
        ])}
      />
      <JsonLd data={getServiceDetailSchema(locale, service)} />
      {service.faqs.length > 0 ? (
        <JsonLd data={getFaqSchema(service.faqs)} />
      ) : null}

      <section className={pageIntro}>
        <PageContainer>
          <nav className="mb-4 text-sm text-ink-muted" aria-label="Breadcrumb">
            <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
              <li>
                <Link
                  href={homePath}
                  className="underline-offset-2 hover:text-primary hover:underline"
                >
                  {copy.calculator.breadcrumbHome}
                </Link>
              </li>
              <li aria-hidden className="text-black/30">
                /
              </li>
              <li>
                <Link
                  href={hubPath}
                  className="underline-offset-2 hover:text-primary hover:underline"
                >
                  {locale === "uz" ? "Xizmatlar" : "Услуги"}
                </Link>
              </li>
              <li aria-hidden className="text-black/30">
                /
              </li>
              <li className="text-black" aria-current="page">
                {service.title}
              </li>
            </ol>
          </nav>
          <h1 className={pageIntroTitle}>{h1}</h1>
          <p className="m-0 mt-3 max-w-2xl text-base text-black/60">
            {service.audience}
          </p>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
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
              <div className="grid grid-cols-2 gap-3 text-sm text-black/70 sm:gap-4 sm:text-base">
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
                <div className="col-span-2">
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
                <p className="col-span-2 m-0">
                  <strong className="font-semibold text-black">
                    {labels.limits}:
                  </strong>{" "}
                  {service.limitations}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={action.href}>
                  {action.isB2b ? copy.ui.requestPrice : copy.ui.calculate}
                </Button>
                <Button
                  href={localePath(locale, "/contacts/")}
                  variant="secondary"
                >
                  {copy.ui.write}
                </Button>
                <Button
                  href={localePath(locale, "/delivery/")}
                  variant="secondary"
                >
                  {locale === "uz" ? "Shaharlarga" : "По городам"}
                </Button>
              </div>

              {service.faqs.length > 0 ? (
                <div className="mt-8 border-t border-border pt-4">
                  {service.faqs.map((faq) => (
                    <details key={faq.question} className={faqDetails}>
                      <summary className={faqSummary}>{faq.question}</summary>
                      <p className="text-black/60">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              ) : null}
            </div>
          </article>

          <div className="mt-10">
            <h2 className={sectionTitle}>
              {locale === "uz" ? "Boshqa xizmatlar" : "Другие услуги"}
            </h2>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={localePath(locale, `/services/${item.id}/`)}
                    className="inline-block rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black hover:border-primary hover:text-primary"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
