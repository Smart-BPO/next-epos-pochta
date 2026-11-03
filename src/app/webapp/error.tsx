"use client";

import { useEffect } from "react";

/**
 * Mini App segment boundary — keeps Telegram shell usable after a page throw.
 */
export default function WebAppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[webapp]", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="m-0 text-xl font-bold text-ink">Texnik xato</h1>
      <p className="mt-2 text-sm text-black/55">
        Xatolik yuz berdi. Qayta urinib koʻring yoki botga qayting.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-black/35">{error.digest}</p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          Qayta urinish
        </button>
        <a
          href="/webapp/"
          className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold text-primary"
        >
          Boshiga
        </a>
      </div>
    </main>
  );
}
