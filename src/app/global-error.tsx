"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for root layout failures.
 * Must render its own <html>/<body> (Next.js requirement).
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[global]", error);
  }, [error]);

  return (
    <html lang="uz">
      <body
        style={{
          margin: 0,
          fontFamily:
            'Manrope, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          background: "#fff",
          color: "#0f1218",
        }}
      >
        <main
          style={{
            maxWidth: 40 * 16,
            margin: "0 auto",
            padding: "4rem 1.25rem",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>
            Texnik xato
          </h1>
          <p style={{ margin: "0.75rem 0 0", color: "rgba(15,18,24,0.55)" }}>
            Xatolik yuz berdi. Sahifani yangilang yoki bosh sahifaga qayting.
          </p>
          {error.digest ? (
            <p
              style={{
                margin: "0.5rem 0 0",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.75rem",
                color: "rgba(15,18,24,0.35)",
              }}
            >
              {error.digest}
            </p>
          ) : null}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                border: 0,
                borderRadius: 999,
                background: "#d30203",
                color: "#fff",
                fontWeight: 600,
                padding: "0.65rem 1.1rem",
                cursor: "pointer",
              }}
            >
              Qayta urinish
            </button>
            {/* Full document remount — plain <a> is intentional outside App Router chrome. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                alignSelf: "center",
                color: "#d30203",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Bosh sahifa
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
