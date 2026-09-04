import Image from "next/image";
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
  homeSectionTitle,
  pageIntro,
  pageIntroTitle,
  section,
  sectionLead,
  sectionMuted,
  sectionTitle,
} from "@/styles/ui";

const SERVICE_MEDIA: Record<
  string,
  { src: string; kind: "photo" | "icon" }
> = {
  documents: { src: "/images/home/needs/documents.png", kind: "photo" },
  parcels: { src: "/images/home/needs/parcels.png", kind: "photo" },
  door: { src: "/images/home/needs/goods.png", kind: "photo" },
  courier: { src: "/images/home/needs/regular.png", kind: "photo" },
  ecommerce: { src: "/images/home/benefits/api.svg", kind: "icon" },
  corporate: { src: "/images/home/benefits/terms.svg", kind: "icon" },
  cod: { src: "/images/home/benefits/sms.svg", kind: "icon" },
  returns: { src: "/images/home/benefits/return.svg", kind: "icon" },
};

function serviceHref(locale: Locale, serviceId: string) {
  const category =
    serviceId === "documents"
      ? "documents"
      : serviceId === "parcels"
        ? "parcel"
        : serviceId === "ecommerce" || serviceId === "cod"
          ? "goods"
          : "";
  const base = localePath(locale, "/request-price/");
  if (category) return `${base}?category=${category}&service=${serviceId}`;
  if (serviceId === "courier") return `${base}?pickup=1&service=${serviceId}`;
  return `${base}?service=${serviceId}`;
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
      <section className={pageIntro}>
        <PageContainer className="flex flex-col gap-6">
          <div>
            <h1 className={pageIntroTitle}>{copy.meta.servicesTitle}</h1>
            <p className={sectionLead}>{copy.services.intro}</p>
            <div className={`${alertInfo} rounded-2xl`}>{copy.services.priceNote}</div>
          </div>
          <nav
            aria-label={labels.catalog}
            className="flex flex-wrap gap-2"
          >
            {copy.services.items.map((service) => (
              <a
                key={service.id}
                href={`#${service.id}`}
                className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black hover:border-primary hover:text-primary"
              >
                {service.title}
              </a>
            ))}
          </nav>
        </PageContainer>
      </section>

      <section className="bg-gradient-to-b from-primary to-primary-hover py-[var(--section-y)]">
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={`${homeSectionTitle} text-white`}>{labels.catalog}</h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {copy.services.items.map((service) => {
              const media = SERVICE_MEDIA[service.id] ?? {
                src: "/images/home/benefits/delivery.svg",
                kind: "icon" as const,
              };
              return (
                <a
                  key={service.id}
                  href={`#${service.id}`}
                  className="flex h-full flex-col gap-4 rounded-3xl border border-black/20 bg-white p-[var(--card-pad)] transition-transform hover:-translate-y-0.5"
                >
                  <h3 className="m-0 min-h-[2.5em] font-display text-xl font-semibold uppercase leading-tight text-black md:text-2xl">
                    {service.title}
                  </h3>
                  <div
                    className={cn(
                      "relative w-full shrink-0 overflow-hidden",
                      media.kind === "photo"
                        ? "h-[10rem] sm:h-[12.5rem]"
                        : "flex h-[10rem] items-center justify-center sm:h-[12.5rem]",
                    )}
                  >
                    {media.kind === "photo" ? (
                      <Image
                        src={media.src}
                        alt=""
                        fill
                        className="object-contain object-center"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <Image
                        src={media.src}
                        alt=""
                        width={64}
                        height={64}
                        unoptimized
                      />
                    )}
                  </div>
                  <p className="m-0 flex-1 text-base text-black/60">
                    {service.audience}
                  </p>
                </a>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {copy.services.items.map((service, index) => {
        const media = SERVICE_MEDIA[service.id] ?? {
          src: "/images/home/benefits/delivery.svg",
          kind: "icon" as const,
        };
        return (
          <section
            key={service.id}
            className={cn(index % 2 ? sectionMuted : section, anchorSection)}
            id={service.id}
          >
            <PageContainer>
              <article className="grid gap-8 rounded-3xl border border-black/20 bg-white p-[var(--card-pad)] lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
                <div
                  className={cn(
                    "relative mx-auto w-full max-w-xs overflow-hidden rounded-3xl bg-surface-muted lg:mx-0",
                    media.kind === "photo"
                      ? "aspect-square"
                      : "flex aspect-square items-center justify-center",
                  )}
                >
                  {media.kind === "photo" ? (
                    <Image
                      src={media.src}
                      alt=""
                      fill
                      className="object-contain p-6"
                      sizes="16rem"
                    />
                  ) : (
                    <Image
                      src={media.src}
                      alt=""
                      width={80}
                      height={80}
                      unoptimized
                    />
                  )}
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

                  <div className="mt-6">
                    <Button href={serviceHref(locale, service.id)}>
                      {copy.ui.requestPrice}
                    </Button>
                  </div>
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
