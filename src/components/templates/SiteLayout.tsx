import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { Header } from "@/components/organisms/Header";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { HashScroll } from "@/components/organisms/HashScroll";

interface SiteLayoutProps {
  locale: Locale;
  children: React.ReactNode;
}

export function SiteLayout({ locale, children }: SiteLayoutProps) {
  const content = getContent(locale);

  return (
    <>
      <HashScroll />
      <Header locale={locale} content={content} />
      <div id="site-content" className="flex-1">
        <main id="main-content">{children}</main>
      </div>
      <SiteFooter locale={locale} content={content} />
    </>
  );
}
