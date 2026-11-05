"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { AccountOtpLink, type AccountLinked } from "@/components/account";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { cabinetCopy } from "@/data/cabinet";

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

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--dash-bg)] px-4 py-8">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <Link
          href={localePath(locale, "/")}
          className="mb-8 inline-flex h-9 self-start"
          aria-label="EPOS POCHTA"
        >
          <BrandLogo locale={locale} priority />
        </Link>

        <h1 className="m-0 text-xl font-semibold text-ink">{c.loginTitle}</h1>
        <p className="mt-1 mb-6 text-sm text-black/55">{c.loginLead}</p>

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

        <p className="mt-8 mb-0 text-xs leading-relaxed text-black/45">
          {c.noAccountHint}{" "}
          <Link
            href={localePath(locale, "/request-price/")}
            className="text-primary underline-offset-2 hover:underline"
          >
            {c.firstOrderCta}
          </Link>
        </p>
      </div>

      <p className="mx-auto mt-8 mb-0 w-full max-w-sm text-xs text-black/40">
        <Link
          href={localePath(locale, "/tracking/")}
          className="underline-offset-2 hover:text-ink hover:underline"
        >
          {c.trackWithoutLogin}
        </Link>
      </p>
    </div>
  );
}
