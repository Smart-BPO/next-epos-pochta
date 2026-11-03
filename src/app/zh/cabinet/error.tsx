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

export default function CabinetZhError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[cabinet:zh]", error);
  }, [error]);

  return (
    <section className={pageIntro}>
      <div className={pageContainer}>
        <h1 className={pageIntroTitle}>技术错误</h1>
        <p className={sectionLead}>发生错误。请刷新页面或返回个人中心。</p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-black/35">{error.digest}</p>
        ) : null}
        <div className={heroActions}>
          <Button type="button" onClick={() => retry()}>
            重试
          </Button>
          <Button href="/zh/cabinet/" variant="secondary">
            个人中心
          </Button>
          <Link
            href="/zh/"
            className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
          >
            返回首页
          </Link>
        </div>
      </div>
    </section>
  );
}
