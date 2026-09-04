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
  if (path.startsWith("/request-price")) return null;

  return (
    <div className="mobile-sticky-cta">
      <Button href={localePath(locale, "/request-price/")}>{label}</Button>
    </div>
  );
}
