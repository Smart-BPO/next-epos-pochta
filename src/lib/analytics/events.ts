export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  // Never include PII in analytics payloads.
  const safe = params ?? {};
  const w = window as Window & {
    gtag?: (...args: unknown[]) => void;
    ym?: (id: number | string, method: string, ...rest: unknown[]) => void;
    dataLayer?: unknown[];
  };
  if (typeof w.gtag === "function") {
    w.gtag("event", name, safe);
  }
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: name, ...safe });
}
