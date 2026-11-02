"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/atoms/Button";
import { localePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/config";
import {
  heroActions,
  pageContainer,
  pageIntro,
  pageIntroTitle,
  sectionLead,
} from "@/styles/ui";

function readLocale(): Locale {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("epos_locale="))
    ?.split("=")[1];
  if (cookie === "ru" || cookie === "zh" || cookie === "uz") return cookie;
  const path = window.location.pathname;
  if (path === "/ru" || path.startsWith("/ru/")) return "ru";
  if (path === "/zh" || path.startsWith("/zh/")) return "zh";
  return "uz";
}

function subscribe() {
  return () => {};
}

const copy = {
  uz: {
    title: "Texnik xato",
    lead: "Xatolik yuz berdi. Sahifani yangilang yoki bosh sahifaga qayting.",
    retry: "Qayta urinish",
    home: "Bosh sahifa",
    track: "Kuzatish",
    request: "Narx soʻrash",
  },
  ru: {
    title: "Техническая ошибка",
    lead: "Произошла ошибка. Попробуйте обновить страницу или вернуться на главную.",
    retry: "Повторить",
    home: "На главную",
    track: "Отследить",
    request: "Запросить стоимость",
  },
  zh: {
    title: "技术错误",
    lead: "发生错误。请刷新页面或返回首页。",
    retry: "重试",
    home: "返回首页",
    track: "查询",
    request: "查询价格",
  },
} as const;

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const locale = useSyncExternalStore(subscribe, readLocale, () => "uz" as Locale);
  const t = copy[locale];

  useEffect(() => {
    console.error("[app]", error);
  }, [error]);

  return (
    <section className={pageIntro}>
      <div className={pageContainer}>
        <h1 className={pageIntroTitle}>{t.title}</h1>
        <p className={sectionLead}>{t.lead}</p>
        <div className={heroActions}>
          <Button type="button" onClick={() => retry()}>
            {t.retry}
          </Button>
          <Button href={localePath(locale, "/")} variant="secondary">
            {t.home}
          </Button>
          <Button href={localePath(locale, "/tracking/")} variant="secondary">
            {t.track}
          </Button>
          <Button
            href={localePath(locale, "/request-price/")}
            variant="secondary"
          >
            {t.request}
          </Button>
        </div>
      </div>
    </section>
  );
}
