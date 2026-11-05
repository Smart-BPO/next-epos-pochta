"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { cn } from "@/lib/cn";
import { SITE_CONFIG } from "@/utils/consts";

type Branding = {
  logoUrl: string | null;
  companyName: string | null;
  name: string | null;
};

let brandingCache: Branding | null | undefined;
let brandingInflight: Promise<Branding | null> | null = null;

function loadBranding(): Promise<Branding | null> {
  if (brandingCache !== undefined) return Promise.resolve(brandingCache);
  if (brandingInflight) return brandingInflight;
  brandingInflight = fetch("/api/account/branding/", { cache: "force-cache" })
    .then(async (res) => {
      if (!res.ok) return null;
      const json = (await res.json()) as Branding;
      const next: Branding = {
        logoUrl: json.logoUrl || null,
        companyName: json.companyName || null,
        name: json.name || null,
      };
      brandingCache = next.logoUrl ? next : null;
      return brandingCache;
    })
    .catch(() => {
      brandingCache = null;
      return null;
    })
    .finally(() => {
      brandingInflight = null;
    });
  return brandingInflight;
}

export function CabinetBrandLogo({
  locale,
  className,
  priority = false,
  width = 92,
  height = 38,
}: {
  locale: Locale;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  const [branding, setBranding] = useState<Branding | null>(
    () => brandingCache ?? null,
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadBranding().then((next) => {
      if (!cancelled) setBranding(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const alt =
    branding?.companyName?.replace(/^"|"$/g, "") ||
    branding?.name ||
    SITE_CONFIG.name;

  if (branding?.logoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- CRM-hosted tenant logo URL
      <img
        src={branding.logoUrl}
        alt={alt}
        width={width}
        height={height}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onError={() => setFailed(true)}
        className={cn(
          "h-full w-auto max-w-full object-contain object-left",
          className,
        )}
      />
    );
  }

  return (
    <BrandLogo
      locale={locale}
      priority={priority}
      width={width}
      height={height}
      className={className}
      alt={alt}
    />
  );
}
