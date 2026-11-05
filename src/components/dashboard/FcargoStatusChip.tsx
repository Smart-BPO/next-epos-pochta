"use client";

import { useDashLocale } from "@/components/dashboard/DashLocaleProvider";
import { dashIntlLocale } from "@/i18n/dashboard";
import { formatDashDate } from "@/lib/cms/lead-display";
import { cn } from "@/lib/cn";
import { fcargoStatusCopy } from "@/lib/tracking/fcargo-status";

const STAGE_TONE: Record<string, string> = {
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-red-200 bg-red-50 text-red-700",
  returned: "border-red-200 bg-red-50 text-red-700",
  delivery_attempt: "border-amber-200 bg-amber-50 text-amber-800",
  created: "border-black/10 bg-black/[0.03] text-black/65",
  accepted: "border-sky-200 bg-sky-50 text-sky-800",
  in_transit: "border-amber-200 bg-amber-50 text-amber-800",
  out_for_delivery: "border-orange-200 bg-orange-50 text-orange-800",
};

export function FcargoStatusChip({
  code,
  updatedAt,
  trackingNumber,
  className,
}: {
  code: string | null | undefined;
  updatedAt?: string | null;
  trackingNumber?: string | null;
  className?: string;
}) {
  const { locale } = useDashLocale();
  if (!code) return null;
  const copy = fcargoStatusCopy(code, locale);
  const tone =
    STAGE_TONE[copy.stage] ?? "border-black/10 bg-black/[0.03] text-black/65";
  const trackPath = locale === "ru" ? "/ru/tracking/" : "/tracking/";

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span
        className={cn(
          "inline-flex w-fit max-w-full items-center gap-1 truncate rounded-md border px-1.5 py-0.5 text-[0.7rem] font-medium",
          tone,
        )}
        title={`${code} · ${copy.label}`}
      >
        {copy.label}
      </span>
      <span className="text-[0.65rem] text-black/35">
        <span className="font-mono uppercase">{code}</span>
        {updatedAt ? ` · ${formatDashDate(updatedAt, dashIntlLocale(locale))}` : ""}
      </span>
      {trackingNumber ? (
        <a
          href={`${trackPath}?number=${encodeURIComponent(trackingNumber)}`}
          target="_blank"
          rel="noreferrer"
          className="w-fit font-mono text-[0.7rem] font-medium text-ink/70 hover:text-primary hover:underline"
        >
          {trackingNumber}
        </a>
      ) : null}
    </div>
  );
}
