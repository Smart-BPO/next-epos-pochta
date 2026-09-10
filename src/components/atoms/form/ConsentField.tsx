"use client";

import Link from "next/link";
import { ErrorMessage, Field } from "formik";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import {
  getLegalBundle,
  type LegalConsentPart,
} from "@/data/legal/documents";
import { checkRow, fieldError } from "@/styles/ui";

export function ConsentLabel({ locale }: { locale: Locale }) {
  const parts = getLegalBundle(locale).consentParts;
  return (
    <span className="text-sm leading-snug text-black/70">
      {parts.map((part, i) => (
        <ConsentPart key={i} part={part} locale={locale} />
      ))}
    </span>
  );
}

export function ConsentField({ locale }: { locale: Locale }) {
  return (
    <>
      <label className={checkRow}>
        <Field
          type="checkbox"
          name="consent"
          className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 accent-[var(--color-primary)]"
        />
        <ConsentLabel locale={locale} />
      </label>
      <ErrorMessage name="consent" component="div" className={fieldError} />
    </>
  );
}

function ConsentPart({
  part,
  locale,
}: {
  part: LegalConsentPart;
  locale: Locale;
}) {
  if (part.type === "text") return part.value;
  if (part.kind === "privacy") {
    return (
      <Link
        href={localePath(locale, "/privacy/")}
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        {part.label}
      </Link>
    );
  }
  if (part.kind === "terms") {
    return (
      <Link
        href={localePath(locale, "/terms/")}
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        {part.label}
      </Link>
    );
  }
  return (
    <a
      href={part.href}
      className="font-medium text-primary underline-offset-2 hover:underline"
      target="_blank"
      rel="noreferrer"
    >
      {part.label}
    </a>
  );
}
