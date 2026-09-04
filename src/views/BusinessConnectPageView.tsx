import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { BusinessConnectForm } from "@/components/organisms/BusinessConnectForm";
import {
  alertInfo,
  pageIntro,
  pageIntroTitle,
  sectionLead,
  sectionMuted,
} from "@/styles/ui";

export function BusinessConnectPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <section className={pageIntro}>
        <PageContainer className="flex max-w-2xl flex-col gap-4">
          <h1 className={pageIntroTitle}>{copy.businessConnect.title}</h1>
          <p className={sectionLead}>{copy.businessConnect.lead}</p>
          <div className={`${alertInfo} rounded-2xl`}>
            {copy.business.connectCtaLead}
          </div>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer>
          <BusinessConnectForm locale={locale} content={copy} />
        </PageContainer>
      </section>
    </>
  );
}
