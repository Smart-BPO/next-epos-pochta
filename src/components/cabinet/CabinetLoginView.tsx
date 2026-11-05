"use client";

import Link from "next/link";
import {
  MapPinned,
  Package,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { AccountOtpLink, type AccountLinked } from "@/components/account";
import { cabinetCopy } from "@/data/cabinet";
import { cabCard } from "@/styles/cabinet";
import { SITE_CONFIG } from "@/utils/consts";

export function CabinetLoginView({
  locale,
  auth,
  initialError,
  onLinked,
}: {
  locale: Locale;
  auth: { kind: "cookie" };
  initialError?: string | null;
  onLinked: (linked: AccountLinked) => void;
}) {
  const c = cabinetCopy(locale);
  const benefits = [
    { icon: MapPinned, text: c.benefitTrack },
    { icon: Zap, text: c.benefitCreate },
    { icon: ShieldCheck, text: c.benefitSecure },
  ];

  return (
    <div className="grid min-h-dvh bg-[var(--dash-bg)] text-[var(--dash-ink)] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-ink px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/40 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <BrandLogo locale={locale} variant="white" width={120} height={40} priority />
          <p className="mt-10 m-0 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
            {c.title}
          </p>
          <h1 className="mt-3 mb-0 font-display text-[clamp(1.8rem,3vw,2.6rem)] font-semibold leading-tight">
            {c.benefitsTitle}
          </h1>
          <ul className="mt-8 mb-0 list-none space-y-4 p-0">
            {benefits.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <span className="pt-1.5 text-[0.95rem] leading-snug text-white/85">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <Link
          href={localePath(locale, "/tracking/")}
          className="relative mt-10 inline-flex items-center gap-2 text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
        >
          <Package className="size-4" aria-hidden />
          {c.trackWithoutLogin}
        </Link>
      </section>

      <section className="flex flex-col justify-center px-4 py-10 sm:px-8">
        <div className={`${cabCard} mx-auto w-full max-w-md p-6 sm:p-8`}>
          <div className="mb-6 lg:hidden">
            <BrandLogo locale={locale} variant="red" width={110} height={36} priority />
          </div>
          <h2 className="m-0 font-display text-2xl font-semibold text-ink">
            {c.loginTitle}
          </h2>
          <p className="mt-2 mb-6 text-sm text-black/55">{c.loginLead}</p>
          <AccountOtpLink
            locale={locale}
            auth={auth}
            probe={false}
            hideIntro
            initialError={initialError ?? null}
            onLinkedChange={(next) => {
              if (next) onLinked(next);
            }}
          />
          <p className="mt-6 mb-0 border-t border-black/[0.06] pt-4 text-xs leading-relaxed text-black/45">
            {c.noAccountHint}{" "}
            <Link
              href={localePath(locale, "/request-price/")}
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              {c.firstOrderCta}
            </Link>
          </p>
          <p className="mt-4 mb-0 text-center text-xs text-black/40">
            <Link
              href={localePath(locale, "/")}
              className="font-medium text-black/55 underline-offset-2 hover:underline"
            >
              {SITE_CONFIG.name}
            </Link>
            {" · "}
            <Link
              href={localePath(locale, "/tracking/")}
              className="font-medium text-black/55 underline-offset-2 hover:underline lg:hidden"
            >
              {c.navTrack}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
