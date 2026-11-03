"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import {
  heroActions,
  pageContainer,
  pageIntro,
  pageIntroTitle,
  sectionLead,
} from "@/styles/ui";

export default function CabinetRuError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[cabinet:ru]", error);
  }, [error]);

  return (
    <section className={pageIntro}>
      <div className={pageContainer}>
        <h1 className={pageIntroTitle}>Техническая ошибка</h1>
        <p className={sectionLead}>
          Произошла ошибка. Обновите страницу или вернитесь в кабинет.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-black/35">{error.digest}</p>
        ) : null}
        <div className={heroActions}>
          <Button type="button" onClick={() => retry()}>
            Повторить
          </Button>
          <Button href="/ru/cabinet/" variant="secondary">
            Кабинет
          </Button>
          <Link
            href="/ru/"
            className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
          >
            На главную
          </Link>
        </div>
      </div>
    </section>
  );
}
