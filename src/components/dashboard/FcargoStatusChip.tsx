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
    STAGE_TONE[copy.stage] ?? "border-primary/20 bg-primary-soft text-primary";
  const trackPath = locale === "ru" ? "/ru/tracking/" : "/tracking/";

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold",
          tone,
        )}
        title={code}
      >
        FCargo · {copy.label}
      </span>
      <span className="text-[0.65rem] text-black/40">
        <span className="font-mono">{code.toUpperCase()}</span>
        {updatedAt ? ` · ${formatDashDate(updatedAt, dashIntlLocale(locale))}` : ""}
      </span>
      {trackingNumber ? (
        <a
          href={`${trackPath}?number=${encodeURIComponent(trackingNumber)}`}
          target="_blank"
          rel="noreferrer"
          className="w-fit font-mono text-[0.7rem] font-medium text-primary hover:underline"
        >
          {trackingNumber}
        </a>
      ) : null}
    </div>
  );
}
