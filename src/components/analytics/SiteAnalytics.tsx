"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SITE_CONFIG } from "@/utils/consts";

function MetrikaRouteHits({ counterId }: { counterId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const w = window as Window & {
      ym?: (id: number | string, method: string, ...rest: unknown[]) => void;
    };
    if (typeof w.ym !== "function") return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    w.ym(counterId, "hit", url);
  }, [counterId, pathname, searchParams]);

  return null;
}

/**
 * Analytics after first paint — `lazyOnload` keeps Metrika/GA off the LCP path.
 * GA4: set NEXT_PUBLIC_GA_ID (G-…); mark SEO_GA4_CONVERSION_EVENTS in GA4 Admin.
 * Do not enable GTM by default (avoids double-counting with gtag + Metrika).
 * Webvisor stays off (heavy main-thread); enable later in Metrika UI if needed.
 */
export function SiteAnalytics() {
  const ga = SITE_CONFIG.analytics.googleAnalyticsId;
  const ym = SITE_CONFIG.analytics.yandexMetrikaId;

  if (!ga && !ym) return null;

  return (
    <>
      {ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="lazyOnload"
          />
          <Script id="ga-init" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${ga}',{anonymize_ip:true,send_page_view:true});`}
          </Script>
        </>
      ) : null}
      {ym ? (
        <>
          <Script id="ym-init" strategy="lazyOnload">{`
(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=${ym}', 'ym');
ym(${ym}, 'init', {
  ssr: true,
  webvisor: false,
  clickmap: true,
  ecommerce: "dataLayer",
  accurateTrackBounce: true,
  trackLinks: true
});
`}</Script>
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc.yandex.ru/watch/${ym}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
          <Suspense fallback={null}>
            <MetrikaRouteHits counterId={ym} />
          </Suspense>
        </>
      ) : null}
    </>
  );
}
