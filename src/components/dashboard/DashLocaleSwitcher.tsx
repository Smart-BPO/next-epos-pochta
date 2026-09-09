"use client";

import { useDashLocale } from "@/components/dashboard/DashLocaleProvider";
import { cn } from "@/lib/cn";
import type { DashLocale } from "@/i18n/dashboard";

export function DashLocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, copy, pending } = useDashLocale();

  const btn = (code: DashLocale, label: string) => (
    <button
      type="button"
      disabled={pending}
      aria-pressed={locale === code}
      className={cn(
        "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
        locale === code
          ? "bg-primary text-white"
          : "text-black/55 hover:bg-black/[0.04] hover:text-ink",
      )}
      onClick={() => setLocale(code)}
    >
      {label}
    </button>
  );

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl border border-black/10 bg-white p-0.5",
        className,
      )}
      role="group"
      aria-label={copy.lang.label}
    >
      {btn("uz", copy.lang.uz)}
      {btn("ru", copy.lang.ru)}
    </div>
  );
}
