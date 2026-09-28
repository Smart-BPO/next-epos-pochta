import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { SITE_CONFIG } from "@/utils/consts";

type BrandLogoVariant = "color" | "red" | "onRed" | "white";

const SRC: Record<BrandLogoVariant, Record<Locale, string>> = {
  color: {
    uz: "/images/brand/logo-uz.svg",
    ru: "/images/brand/logo-ru.svg",
  },
  red: {
    uz: "/images/brand/logo-uz-red.svg",
    ru: "/images/brand/logo-ru-red.svg",
  },
  onRed: {
    uz: "/images/brand/logo-uz-color.svg",
    ru: "/images/brand/logo-ru-color.svg",
  },
  white: {
    uz: "/images/brand/logo-uz-white.svg",
    ru: "/images/brand/logo-ru-white.svg",
  },
};

export function BrandLogo({
  locale = "uz",
  variant = "color",
  width = 92,
  height = 38,
  className,
  priority = false,
  alt,
}: {
  locale?: Locale;
  variant?: BrandLogoVariant;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <Image
      src={SRC[variant][locale]}
      alt={alt ?? SITE_CONFIG.name}
      width={width}
      height={height}
      className={cn("h-full w-auto", className)}
      priority={priority}
      unoptimized
    />
  );
}
