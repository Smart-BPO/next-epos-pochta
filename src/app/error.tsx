"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/atoms/Button";
import { localePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/config";

function readLocale(): Locale {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("epos_locale="))
    ?.split("=")[1];
  if (cookie === "ru") return "ru";
  if (window.location.pathname.startsWith("/ru")) return "ru";
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
} as const;

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useSyncExternalStore(subscribe, readLocale, () => "uz" as Locale);
  const t = copy[locale];

  return (
    <section className="page-intro">
      <div className="page-container">
        <h1>{t.title}</h1>
        <p className="section-lead">{t.lead}</p>
        <div className="hero-actions">
          <Button type="button" onClick={reset}>
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
