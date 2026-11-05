"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  LogOut,
  PackagePlus,
  Phone,
  Send,
} from "lucide-react";
import { intlLocale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { cabinetCopy } from "@/data/cabinet";
import { accountCopy } from "@/data/account-copy";
import { Button } from "@/components/atoms/Button";
import {
  AccountShipmentDetail,
  AccountShipmentForm,
  AccountShipmentList,
  type AccountShipmentRow,
} from "@/components/account";
import { TrackingLookup } from "@/components/tracking/TrackingLookup";
import { CalculatorForm } from "@/components/organisms/CalculatorForm";
import { CabinetHomeView } from "@/components/cabinet/CabinetHomeView";
import { useCabinetData } from "@/components/cabinet/CabinetData";
import { AccountStatusBadge } from "@/components/account/AccountStatusBadge";
import { SITE_CONFIG } from "@/utils/consts";
import {
  cabinetHref,
  cabinetShipmentHref,
  useCabinet,
} from "@/views/cabinet/CabinetShell";
import { cabCard, cabPageLead, cabPageTitle } from "@/styles/cabinet";
import { useEffect, useState } from "react";
import { fetchPublicPricingUi } from "@/lib/pricing/client";
import type { PublicPricingUiConfig } from "@/lib/pricing/types";

export function CabinetHomePageView() {
  return <CabinetHomeView />;
}

export function CabinetShipmentsView() {
  const { locale, auth, onRelinkRequired, setTotal, createdTracking } =
    useCabinet();
  const c = cabinetCopy(locale);
  const router = useRouter();
  const search = useSearchParams();
  const q = search.get("q") ?? "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className={cabPageTitle}>{c.navOrders}</h1>
        <Button href={cabinetHref(locale, "new/")} size="sm">
          <PackagePlus className="size-4" aria-hidden />
          {c.navNew}
        </Button>
      </div>
      {q ? (
        <p className="m-0 text-sm text-[var(--dash-muted)]">
          «{q}»
        </p>
      ) : null}
      <AccountShipmentList
        locale={locale}
        auth={auth}
        highlightTracking={createdTracking}
        onOpen={(row: AccountShipmentRow) =>
          router.push(cabinetShipmentHref(locale, row.trackingNumber))
        }
        onRelinkRequired={onRelinkRequired}
        onTotal={setTotal}
        onCreate={() => router.push(cabinetHref(locale, "new/"))}
      />
    </div>
  );
}

export function CabinetReturnsView() {
  const { locale } = useCabinet();
  const stats = useCabinetData();
  const c = cabinetCopy(locale);
  const rows = stats.items.filter(
    (r) => r.stage === "returned" || r.stage === "cancelled",
  );

  return (
    <div className="space-y-4">
      <h1 className={cabPageTitle}>{c.navReturns}</h1>
      <div className={`${cabCard} divide-y divide-black/[0.06]`}>
        {stats.loaded && rows.length === 0 ? (
          <p className="m-0 p-6 text-sm text-[var(--dash-muted)]">
            {c.returnsEmpty}
          </p>
        ) : null}
        {rows.map((row) => (
          <Link
            key={row.trackingNumber}
            href={cabinetShipmentHref(locale, row.trackingNumber)}
            className="flex items-center justify-between gap-3 px-4 py-3 no-underline hover:bg-black/[0.02]"
          >
            <div className="min-w-0">
              <p className="m-0 font-mono text-sm font-semibold text-ink">
                {row.trackingNumber}
              </p>
              <p className="m-0 truncate text-xs text-[var(--dash-muted)]">
                {[row.fromLabel, row.toLabel].filter(Boolean).join(" → ")}
              </p>
            </div>
            <AccountStatusBadge stage={row.stage} label={row.statusLabel} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CabinetShipmentView({ tracking }: { tracking: string }) {
  const { locale, auth, onRelinkRequired } = useCabinet();
  const c = cabinetCopy(locale);

  return (
    <div className="space-y-3">
      <Link
        href={cabinetHref(locale, "orders/")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--dash-muted)] no-underline hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {c.backToList}
      </Link>
      <div className={`${cabCard} p-5 sm:p-7`}>
        <AccountShipmentDetail
          locale={locale}
          auth={auth}
          trackingNumber={tracking}
          onRelinkRequired={onRelinkRequired}
        />
      </div>
    </div>
  );
}

export function CabinetNewView() {
  const { locale, auth, createdTracking, setCreatedTracking } = useCabinet();
  const c = cabinetCopy(locale);
  const a = accountCopy(locale);
  const router = useRouter();
  const search = useSearchParams();
  const prefill = {
    from: search.get("from") ?? undefined,
    to: search.get("to") ?? undefined,
    weight: search.get("w") ?? undefined,
  };

  return (
    <div className="space-y-4">
      <h1 className={cabPageTitle}>{c.navNew}</h1>
      <div className={`max-w-2xl ${cabCard} p-5 sm:p-7`}>
        {createdTracking ? (
          <div className="flex flex-col items-center py-4 text-center">
            <CheckCircle2 className="size-12 text-emerald-600" aria-hidden />
            <h2 className="mt-3 mb-0 font-display text-xl font-semibold text-ink">
              {a.successTitle}
            </h2>
            <p className="mt-2 mb-0 text-sm text-black/55">{a.trackLabel}</p>
            <p className="m-0 font-mono text-lg font-semibold text-ink">
              {createdTracking}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                onClick={() =>
                  router.push(cabinetShipmentHref(locale, createdTracking))
                }
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
    </div>
  );
}

export function CabinetTrackingView() {
  const { locale } = useCabinet();
  const c = cabinetCopy(locale);

  return (
    <div className="space-y-4">
      <div>
        <h1 className={cabPageTitle}>{c.trackTitle}</h1>
        <p className={cabPageLead}>{c.trackLead}</p>
      </div>
      <TrackingLookup
        locale={locale}
        className="border-[var(--dash-border)] sm:border-[var(--dash-border)]"
      />
    </div>
  );
}

export function CabinetCalculatorView() {
  const { locale } = useCabinet();
  const c = cabinetCopy(locale);
  const copy = getContent(locale);
  const [publicUi, setPublicUi] = useState<PublicPricingUiConfig | null>(null);

  useEffect(() => {
    void fetchPublicPricingUi().then(setPublicUi);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className={cabPageTitle}>{c.navCalculator}</h1>
      <div className={`max-w-3xl ${cabCard} p-5 sm:p-7`}>
        <CalculatorForm
          locale={locale}
          content={copy}
          publicUi={publicUi}
          cabinet
        />
      </div>
    </div>
  );
}

export function CabinetFinanceView() {
  const { locale } = useCabinet();
  const c = cabinetCopy(locale);

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className={cabPageTitle}>{c.financeTitle}</h1>
      <div className={`${cabCard} p-5 sm:p-7`}>
        <p className="m-0 text-sm leading-relaxed text-[var(--dash-muted)]">
          {c.financeLead}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button href={`tel:${SITE_CONFIG.phone}`} size="sm">
            <Phone className="size-4" aria-hidden />
            {c.managerCall}
          </Button>
          <Button
            href={SITE_CONFIG.telegramUrl}
            variant="secondary"
            size="sm"
            target="_blank"
            rel="noreferrer"
          >
            <Send className="size-4" aria-hidden />
            {c.financeCta}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CabinetReportsView() {
  const { locale } = useCabinet();
  const stats = useCabinetData();
  const c = cabinetCopy(locale);

  return (
    <div className="space-y-4">
      <div>
        <h1 className={cabPageTitle}>{c.reportsTitle}</h1>
        <p className={cabPageLead}>{c.reportsLead}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: c.statTotal, value: stats.total },
          { label: c.kpiDelivered, value: stats.counts.delivered },
          { label: c.kpiReturns, value: stats.returns },
        ].map((x) => (
          <div key={x.label} className={`${cabCard} p-4`}>
            <p className="m-0 text-xs text-[var(--dash-muted)]">{x.label}</p>
            <p className="m-0 font-display text-2xl font-bold">{x.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CabinetHelpView() {
  const { locale } = useCabinet();
  const c = cabinetCopy(locale);

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className={cabPageTitle}>{c.helpTitle}</h1>
      <div className={`${cabCard} p-5 sm:p-7`}>
        <p className="m-0 text-sm text-[var(--dash-muted)]">{c.supportLead}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            href={SITE_CONFIG.telegramUrl}
            variant="telegram"
            size="sm"
            target="_blank"
            rel="noreferrer"
          >
            <Send className="size-4" aria-hidden />
            Telegram
          </Button>
          <Button href={`tel:${SITE_CONFIG.phone}`} variant="outline" size="sm">
            <Phone className="size-4" aria-hidden />
            {SITE_CONFIG.phoneDisplay}
          </Button>
        </div>
        <p className="mt-4 mb-0 text-xs text-[var(--dash-faint)]">
          {c.managerHours}
        </p>
      </div>
    </div>
  );
}

export function CabinetProfileView() {
  const { locale, linked, logout, loggingOut } = useCabinet();
  const c = cabinetCopy(locale);
  const a = accountCopy(locale);
  const linkedSince = linked.linkedAt
    ? new Intl.DateTimeFormat(intlLocale(locale), {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(linked.linkedAt))
    : null;
  const rows = [
    { label: c.profileName, value: linked.displayName || "—" },
    { label: c.profilePhone, value: linked.phone },
    ...(linkedSince ? [{ label: c.profileSince, value: linkedSince }] : []),
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className={cabPageTitle}>{c.profileTitle}</h1>
      <div className={`${cabCard} p-5 sm:p-7`}>
        <dl className="m-0 divide-y divide-black/[0.06]">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <dt className="text-sm text-black/50">{row.label}</dt>
              <dd className="m-0 text-right text-sm font-semibold text-ink">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            disabled={loggingOut}
            onClick={() => void logout()}
          >
            <LogOut className="size-4" aria-hidden />
            {a.logout}
          </Button>
        </div>
      </div>
    </div>
  );
}
