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
import { SITE_CONFIG } from "@/utils/consts";
import {
  cabinetHref,
  cabinetShipmentHref,
  useCabinet,
} from "@/views/cabinet/CabinetShell";
import { cabCard, cabPageLead, cabPageTitle } from "@/styles/cabinet";

export function CabinetShipmentsView() {
  const { locale, auth, onRelinkRequired, setTotal, createdTracking } =
    useCabinet();
  const c = cabinetCopy(locale);
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={cabPageTitle}>{c.navShipments}</h1>
        </div>
        <div className="hidden lg:block">
          <Button href={cabinetHref(locale, "new/")} size="sm">
            <PackagePlus className="size-4" aria-hidden />
            {c.navNew}
          </Button>
        </div>
      </div>
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

export function CabinetShipmentView({ tracking }: { tracking: string }) {
  const { locale, auth, onRelinkRequired } = useCabinet();
  const c = cabinetCopy(locale);

  return (
    <div className="space-y-3">
      <Link
        href={cabinetHref(locale)}
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

      <div className="rounded-[var(--dash-radius)] bg-black/[0.03] p-5 sm:p-7">
        <h2 className="m-0 font-display text-lg font-semibold text-ink">
          {c.supportTitle}
        </h2>
        <p className="mt-1 mb-4 text-sm text-black/55">{c.supportLead}</p>
        <div className="flex flex-wrap gap-2">
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
      </div>
    </div>
  );
}
