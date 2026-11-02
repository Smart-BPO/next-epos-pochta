"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import {
  dashBtnPrimary,
  dashBtnSecondary,
  dashCardPad,
  dashPageLead,
  dashPageTitle,
} from "@/styles/dashboard";

/**
 * Keeps dashboard chrome (sidebar/top bar from parent layout) when a page throws.
 * Without this, errors bubble to the public `app/error.tsx` and drop CMS navigation.
 */
export default function DashboardAppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useDashT();

  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <section className={dashCardPad}>
      <h1 className={dashPageTitle}>{t.errors.generic}</h1>
      <p className={dashPageLead}>{t.common.errorLead}</p>
      {error.digest ? (
        <p className="m-0 mt-2 font-mono text-xs text-black/35">
          {error.digest}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className={dashBtnPrimary} onClick={() => retry()}>
          {t.common.retry}
        </button>
        <Link href="/dashboard/" className={dashBtnSecondary}>
          {t.common.goOverview}
        </Link>
        <Link href="/dashboard/leads/" className={dashBtnSecondary}>
          {t.nav.leads}
        </Link>
      </div>
    </section>
  );
}
