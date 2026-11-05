"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { cabinetCopy } from "@/data/cabinet";
import { accountCopy } from "@/data/account-copy";
import { PageContainer } from "@/components/atoms/PageContainer";
import { Button } from "@/components/atoms/Button";
import {
  AccountOtpLink,
  AccountShipmentDetail,
  AccountShipmentForm,
  AccountShipmentList,
  type AccountLinked,
  type AccountShipmentRow,
} from "@/components/account";
import {
  pageIntro,
  pageIntroTitle,
  sectionLead,
} from "@/styles/ui";
import { cn } from "@/lib/cn";

type Tab = "shipments" | "new" | "profile";

export function CabinetPageView({ locale }: { locale: Locale }) {
  const c = cabinetCopy(locale);
  const a = accountCopy(locale);
  const search = useSearchParams();
  const auth = useMemo(() => ({ kind: "cookie" as const }), []);

  const tabParam = search.get("tab");
  const initialTab: Tab =
    tabParam === "new" || tabParam === "profile" || tabParam === "shipments"
      ? tabParam
      : "shipments";

  const [linked, setLinked] = useState<AccountLinked | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [detailTracking, setDetailTracking] = useState<string | null>(null);
  const [createdTracking, setCreatedTracking] = useState<string | null>(null);

  const prefill = {
    from: search.get("from") ?? undefined,
    to: search.get("to") ?? undefined,
    weight: search.get("w") ?? undefined,
  };

  const onLinkedChange = (next: AccountLinked | null) => {
    setLinked(next);
    setReady(true);
    if (!next) {
      setDetailTracking(null);
      setCreatedTracking(null);
    }
  };

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "shipments", label: a.tabShipments },
    { id: "new", label: a.tabNew },
    { id: "profile", label: a.tabProfile },
  ];

  return (
    <PageContainer className="py-8 sm:py-12">
      <header className={pageIntro}>
        <h1 className={pageIntroTitle}>{c.title}</h1>
        <p className={sectionLead}>{c.lead}</p>
      </header>

      {!ready ? (
        <div className="mt-8 max-w-md">
          <AccountOtpLink
            locale={locale}
            auth={auth}
            onLinkedChange={onLinkedChange}
          />
        </div>
      ) : !linked ? (
        <div className="mt-8 max-w-md rounded-2xl border border-black/8 bg-white p-5">
          <AccountOtpLink
            locale={locale}
            auth={auth}
            onLinkedChange={onLinkedChange}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          <div className="flex flex-wrap gap-2 border-b border-black/8 pb-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setDetailTracking(null);
                  if (t.id !== "new") setCreatedTracking(null);
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  tab === t.id
                    ? "bg-primary text-white"
                    : "bg-black/[0.04] text-black/60 hover:bg-black/[0.07]",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "shipments" ? (
            detailTracking ? (
              <div className="rounded-2xl border border-black/8 bg-white p-5">
                <AccountShipmentDetail
                  locale={locale}
                  auth={auth}
                  trackingNumber={detailTracking}
                  onClose={() => setDetailTracking(null)}
                  onRelinkRequired={() => onLinkedChange(null)}
                />
              </div>
            ) : (
              <AccountShipmentList
                locale={locale}
                auth={auth}
                highlightTracking={createdTracking}
                onOpen={(row: AccountShipmentRow) =>
                  setDetailTracking(row.trackingNumber)
                }
                onRelinkRequired={() => onLinkedChange(null)}
              />
            )
          ) : null}

          {tab === "new" ? (
            <div className="max-w-lg rounded-2xl border border-black/8 bg-white p-5">
              {createdTracking ? (
                <div className="space-y-3">
                  <h2 className="m-0 font-display text-xl font-bold text-ink">
                    {a.successTitle}
                  </h2>
                  <p className="m-0 font-mono text-sm font-semibold">
                    {a.trackLabel}: {createdTracking}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setDetailTracking(createdTracking);
                        setTab("shipments");
                      }}
                    >
                      {a.openShipment}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCreatedTracking(null)}
                    >
                      {a.anotherShipment}
                    </Button>
                  </div>
                </div>
              ) : (
                <AccountShipmentForm
                  locale={locale}
                  auth={auth}
                  prefill={prefill}
                  onSuccess={(tracking) => setCreatedTracking(tracking)}
                />
              )}
            </div>
          ) : null}

          {tab === "profile" ? (
            <div className="max-w-md rounded-2xl border border-black/8 bg-white p-5">
              <AccountOtpLink
                locale={locale}
                auth={auth}
                onLinkedChange={onLinkedChange}
                compact
              />
            </div>
          ) : null}
        </div>
      )}
    </PageContainer>
  );
}
