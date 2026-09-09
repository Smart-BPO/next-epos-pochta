"use client";

import { DashPopover } from "@/components/dashboard/ds/DashPopover";
import { useDashLocale } from "@/components/dashboard/DashLocaleProvider";
import { cn } from "@/lib/cn";
import type { DashLocale } from "@/i18n/dashboard";

export function DashLocaleMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { locale, setLocale, copy, pending } = useDashLocale();

  const pick = (code: DashLocale) => {
    setLocale(code);
    onOpenChange(false);
  };

  return (
    <DashPopover
      open={open}
      onOpenChange={onOpenChange}
      panelWidth="9rem"
      trigger={({ ref, onClick, ...a11y }) => (
        <button
          type="button"
          ref={ref as React.RefCallback<HTMLButtonElement>}
          onClick={onClick}
          {...a11y}
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-black/10 bg-white px-2.5 text-xs font-bold text-ink transition hover:bg-black/[0.03]"
          aria-label={copy.lang.label}
        >
          {locale.toUpperCase()}
        </button>
      )}
    >
      <div className="p-1.5" role="group" aria-label={copy.lang.label}>
        {(["uz", "ru"] as const).map((code) => (
          <button
            key={code}
            type="button"
            disabled={pending}
            className={cn(
              "flex w-full items-center rounded-lg px-3 py-2 text-sm font-semibold transition",
              locale === code
                ? "bg-primary-soft text-primary"
                : "text-ink hover:bg-black/[0.03]",
            )}
            onClick={() => pick(code)}
          >
            {code === "uz" ? copy.lang.uz : copy.lang.ru}
          </button>
        ))}
      </div>
    </DashPopover>
  );
}
