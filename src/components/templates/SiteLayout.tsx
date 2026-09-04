import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { Header } from "@/components/organisms/Header";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { FloatingContact } from "@/components/organisms/FloatingContact";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";

interface SiteLayoutProps {
  locale: Locale;
  children: React.ReactNode;
}

export function SiteLayout({ locale, children }: SiteLayoutProps) {
  const content = getContent(locale);

  return (
    <>
      <Header locale={locale} content={content} />
      <div id="site-content">
        <main id="main-content">{children}</main>
      </div>
      <SiteFooter locale={locale} content={content} />
      <FloatingContact
        phoneLabel={content.ui.floatingPhone}
        telegramLabel={content.ui.floatingTelegram}
      />
      <CookieConsentBanner
        text={content.ui.cookieText}
        acceptLabel={content.ui.cookieAccept}
        declineLabel={content.ui.cookieDecline}
      />
    </>
  );
}
