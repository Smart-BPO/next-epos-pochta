"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import {
  heroActions,
  pageContainer,
  pageIntro,
  pageIntroTitle,
  sectionLead,
} from "@/styles/ui";

export default function CabinetError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[cabinet]", error);
  }, [error]);

  return (
    <section className={pageIntro}>
      <div className={pageContainer}>
        <h1 className={pageIntroTitle}>Texnik xato</h1>
        <p className={sectionLead}>
          Xatolik yuz berdi. Sahifani yangilang yoki kabinetga qayting.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-black/35">{error.digest}</p>
        ) : null}
        <div className={heroActions}>
          <Button type="button" onClick={() => retry()}>
            Qayta urinish
          </Button>
          <Button href="/cabinet/" variant="secondary">
            Kabinet
          </Button>
          <Link
            href="/"
            className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
          >
            Bosh sahifa
          </Link>
        </div>
      </div>
    </section>
  );
}
