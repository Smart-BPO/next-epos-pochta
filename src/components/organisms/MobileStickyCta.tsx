"use client";

import { usePathname } from "next/navigation";
import { localePath, stripLocalePrefix } from "@/i18n/paths";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/atoms/Button";

export function MobileStickyCta({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname() || "/";
  const { path } = stripLocalePrefix(pathname);
  if (path.startsWith("/request-price") || path.startsWith("/calculator")) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[35] border-t border-black/10 bg-white/94 px-[var(--page-padding)] py-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(15_18_24/0.08)] backdrop-blur-md md:hidden">
      <Button href={localePath(locale, "/calculator/")} className="w-full">
        {label}
      </Button>
    </div>
  );
}
