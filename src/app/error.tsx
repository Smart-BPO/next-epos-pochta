"use client";

import { Button } from "@/components/atoms/Button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="section">
      <div className="page-container">
        <h1 className="section-title">Техническая ошибка</h1>
        <p className="section-lead">
          Произошла ошибка. Попробуйте обновить страницу или вернуться на главную.
        </p>
        <div className="hero-actions">
          <Button type="button" onClick={reset}>
            Повторить
          </Button>
          <Button href="/" variant="secondary">
            На главную
          </Button>
          <Button href="/tracking/" variant="secondary">
            Отследить
          </Button>
          <Button href="/request-price/" variant="secondary">
            Запросить стоимость
          </Button>
        </div>
      </div>
    </section>
  );
}
