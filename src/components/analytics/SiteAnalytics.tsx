"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { SITE_CONFIG } from "@/utils/consts";

const STORAGE_KEY = "epos_cookie_consent";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getConsentSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "accepted";
}

function getServerSnapshot() {
  return false;
}

export function SiteAnalytics() {
  const allowed = useSyncExternalStore(
    subscribe,
    getConsentSnapshot,
    getServerSnapshot,
  );
  const ga = SITE_CONFIG.analytics.googleAnalyticsId;
  const ym = SITE_CONFIG.analytics.yandexMetrikaId;

  if (!allowed) return null;

  return (
    <>
      {ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${ga}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
      {ym ? (
        <Script id="ym-init" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${ym},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});`}
        </Script>
      ) : null}
    </>
  );
}
