import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { homeSectionTitle, pageCta, section } from "@/styles/ui";

export function PageCta({
  locale,
  content,
}: {
  locale: Locale;
  content: SiteCopy;
}) {
  return (
    <section className={`${section} pt-0`}>
      <PageContainer>
        <div className={`${pageCta} md:min-h-[17.5rem]`}>
          <div className="relative z-10 flex max-w-xl flex-col gap-4">
            <h2 className={`${homeSectionTitle} text-white`}>{content.cta.title}</h2>
            <p className="m-0 text-[length:var(--home-lead)] text-white/60">
              {content.cta.lead}
            </p>
            <div className="mt-2">
              <Button href={localePath(locale, "/request-price/")} variant="primary">
                {content.ui.requestPrice}
              </Button>
            </div>
          </div>
          <Image
            src="/images/home/cta/devices.png"
            alt=""
            width={442}
            height={230}
            className="pointer-events-none relative mx-auto mt-8 block h-auto w-full max-w-md select-none object-contain object-bottom md:absolute md:-bottom-1 md:right-0 md:mx-0 md:mt-0 md:h-[min(100%,18.5rem)] md:w-[min(52%,28rem)] md:max-w-none md:object-cover md:object-top"
            sizes="(max-width: 768px) 100vw, 28rem"
          />
        </div>
      </PageContainer>
    </section>
  );
}
