"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  LogOut,
  MapPinned,
  Package,
  PackagePlus,
  Phone,
  Send,
  ShieldCheck,
  UserRound,
  Zap,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { intlLocale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
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
import { SITE_CONFIG } from "@/utils/consts";
import { cn } from "@/lib/cn";

type Tab = "shipments" | "new" | "profile";
type Session =
  | { state: "loading" }
  | { state: "guest"; error?: string | null }
  | { state: "linked"; linked: AccountLinked };

function parseTab(raw: string | null): Tab {
  return raw === "new" || raw === "profile" || raw === "shipments"
    ? raw
    : "shipments";
}

function initials(linked: AccountLinked) {
  const name = linked.displayName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("");
  }
  return linked.phone.replace(/\D/g, "").slice(-2);
}

export function CabinetPageView({ locale }: { locale: Locale }) {
  const c = cabinetCopy(locale);
  const a = accountCopy(locale);
  const router = useRouter();
  const search = useSearchParams();
  const auth = useMemo(() => ({ kind: "cookie" as const }), []);

  const [session, setSession] = useState<Session>({ state: "loading" });
  const [tab, setTabState] = useState<Tab>(() => parseTab(search.get("tab")));
  const [detailTracking, setDetailTracking] = useState<string | null>(null);
  const [createdTracking, setCreatedTracking] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const prefill = {
    from: search.get("from") ?? undefined,
    to: search.get("to") ?? undefined,
    weight: search.get("w") ?? undefined,
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/account/me/", { cache: "no-store" });
        const json = (await res.json()) as {
          linked?: AccountLinked | null;
          error?: string;
        };
        if (cancelled) return;
        if (json.linked) {
          setSession({ state: "linked", linked: json.linked });
        } else {
          setSession({
            state: "guest",
            error:
              json.error === "relink_required" ? a.relinkRequired : null,
          });
        }
      } catch {
        if (!cancelled) setSession({ state: "guest" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [a.relinkRequired]);

  const setTab = useCallback(
    (next: Tab) => {
      setTabState(next);
      setDetailTracking(null);
      if (next !== "new") setCreatedTracking(null);
      const params = new URLSearchParams(search.toString());
      if (next === "shipments") params.delete("tab");
      else params.set("tab", next);
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [router, search],
  );

  const onRelinkRequired = useCallback(() => {
    setSession({ state: "guest", error: a.relinkRequired });
    setDetailTracking(null);
    setCreatedTracking(null);
    setTotal(null);
  }, [a.relinkRequired]);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/account/logout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
    } catch {
      // cookie is cleared server-side; local state resets regardless
    } finally {
      setSession({ state: "guest" });
      setDetailTracking(null);
      setCreatedTracking(null);
      setTotal(null);
      setLoggingOut(false);
    }
  };

  if (session.state === "loading") {
    return (
      <PageContainer className="py-8 sm:py-12">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[260px_minmax(0,1fr)]" aria-busy>
          <div className="h-48 animate-pulse rounded-3xl bg-black/[0.04]" />
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded-2xl bg-black/[0.04]" />
            <div className="h-24 animate-pulse rounded-2xl bg-black/[0.04]" />
            <div className="h-24 animate-pulse rounded-2xl bg-black/[0.04]" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (session.state === "guest") {
    const benefits = [
      { icon: MapPinned, text: c.benefitTrack },
      { icon: Zap, text: c.benefitCreate },
      { icon: ShieldCheck, text: c.benefitSecure },
    ];
    return (
      <PageContainer className="py-8 sm:py-14">
        <div className="grid grid-cols-[minmax(0,1fr)] items-stretch gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8">
          <section className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-10">
            <div
              className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/40 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                EPOS POCHTA · {c.title}
              </p>
              <h1 className="mt-3 mb-0 font-display text-[clamp(1.6rem,3.6vw,2.4rem)] font-semibold leading-tight">
                {c.benefitsTitle}
              </h1>
              <ul className="mt-7 mb-0 list-none space-y-4 p-0">
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
              <Link
                href={localePath(locale, "/tracking/")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
              >
                <Package className="size-4" aria-hidden />
                {c.trackWithoutLogin}
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-black/[0.08] bg-white p-6 sm:p-10">
            <h2 className="m-0 font-display text-2xl font-semibold text-ink">
              {c.loginTitle}
            </h2>
            <p className="mt-2 mb-6 text-sm text-black/55">{c.loginLead}</p>
            <AccountOtpLink
              locale={locale}
              auth={auth}
              probe={false}
              hideIntro
              initialError={session.error ?? null}
              onLinkedChange={(next) => {
                if (next) setSession({ state: "linked", linked: next });
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
          </section>
        </div>
      </PageContainer>
    );
  }

  const { linked } = session;
  const nav: Array<{ id: Tab; label: string; icon: typeof Package }> = [
    { id: "shipments", label: c.navShipments, icon: Package },
    { id: "new", label: c.navNew, icon: PackagePlus },
    { id: "profile", label: c.navProfile, icon: UserRound },
  ];
  const linkedSince = linked.linkedAt
    ? new Intl.DateTimeFormat(intlLocale(locale), {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(linked.linkedAt))
    : null;

  return (
    <PageContainer className="py-6 sm:py-10">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <aside className="min-w-0 space-y-3 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-black/[0.08] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-white">
                {initials(linked)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-xs text-black/45">{c.greeting},</p>
                <p className="m-0 truncate font-display text-base font-semibold text-ink">
                  {linked.displayName || linked.phone}
                </p>
                {linked.displayName ? (
                  <p className="m-0 truncate text-xs text-black/45">
                    {linked.phone}
                  </p>
                ) : null}
              </div>
              {total != null ? (
                <div className="shrink-0 text-right lg:hidden">
                  <p className="m-0 font-display text-2xl font-semibold leading-none text-ink">
                    {total}
                  </p>
                  <p className="m-0 mt-1 max-w-[6rem] text-[11px] leading-tight text-black/45">
                    {c.statTotal}
                  </p>
                </div>
              ) : null}
            </div>
            {total != null ? (
              <div className="mt-4 hidden rounded-2xl bg-black/[0.03] px-4 py-3 lg:block">
                <p className="m-0 text-xs text-black/45">{c.statTotal}</p>
                <p className="m-0 font-display text-2xl font-semibold text-ink">
                  {total}
                </p>
              </div>
            ) : null}
          </div>

          <nav
            aria-label={c.title}
            className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:rounded-3xl lg:border lg:border-black/[0.08] lg:bg-white lg:p-2"
          >
            {nav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={tab === id ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-semibold transition lg:w-full",
                  tab === id
                    ? "bg-primary text-white"
                    : "bg-white text-black/65 ring-1 ring-black/[0.08] hover:text-ink lg:bg-transparent lg:ring-0 lg:hover:bg-black/[0.04]",
                )}
              >
                <Icon className="size-[18px]" aria-hidden />
                {label}
              </button>
            ))}
            <Link
              href={localePath(locale, "/tracking/")}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black/65 no-underline ring-1 ring-black/[0.08] transition hover:text-ink lg:w-full lg:bg-transparent lg:ring-0 lg:hover:bg-black/[0.04]"
            >
              <MapPinned className="size-[18px]" aria-hidden />
              {c.navTrack}
            </Link>
            <button
              type="button"
              disabled={loggingOut}
              onClick={() => void logout()}
              className="hidden items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-semibold text-black/45 transition hover:bg-black/[0.04] hover:text-primary disabled:opacity-50 lg:inline-flex lg:w-full"
            >
              <LogOut className="size-[18px]" aria-hidden />
              {a.logout}
            </button>
          </nav>
        </aside>

        <main className="min-w-0">
          {tab === "shipments" ? (
            detailTracking ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setDetailTracking(null)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-black/55 hover:text-ink"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  {c.backToList}
                </button>
                <div className="rounded-3xl border border-black/[0.08] bg-white p-5 sm:p-7">
                  <AccountShipmentDetail
                    locale={locale}
                    auth={auth}
                    trackingNumber={detailTracking}
                    onRelinkRequired={onRelinkRequired}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h1 className="m-0 font-display text-2xl font-semibold text-ink sm:text-[1.75rem]">
                    {c.navShipments}
                  </h1>
                  <div className="hidden lg:block">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setTab("new")}
                    >
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
                    setDetailTracking(row.trackingNumber)
                  }
                  onRelinkRequired={onRelinkRequired}
                  onTotal={setTotal}
                  onCreate={() => setTab("new")}
                />
              </div>
            )
          ) : null}

          {tab === "new" ? (
            <div className="space-y-4">
              <h1 className="m-0 font-display text-2xl font-semibold text-ink sm:text-[1.75rem]">
                {c.navNew}
              </h1>
              <div className="max-w-2xl rounded-3xl border border-black/[0.08] bg-white p-5 sm:p-7">
                {createdTracking ? (
                  <div className="flex flex-col items-center py-4 text-center">
                    <CheckCircle2
                      className="size-12 text-emerald-600"
                      aria-hidden
                    />
                    <h2 className="mt-3 mb-0 font-display text-xl font-semibold text-ink">
                      {a.successTitle}
                    </h2>
                    <p className="mt-2 mb-0 text-sm text-black/55">
                      {a.trackLabel}
                    </p>
                    <p className="m-0 font-mono text-lg font-semibold text-ink">
                      {createdTracking}
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          const t = createdTracking;
                          setTab("shipments");
                          setCreatedTracking(t);
                          setDetailTracking(t);
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
            </div>
          ) : null}

          {tab === "profile" ? (
            <div className="max-w-2xl space-y-4">
              <h1 className="m-0 font-display text-2xl font-semibold text-ink sm:text-[1.75rem]">
                {c.profileTitle}
              </h1>
              <div className="rounded-3xl border border-black/[0.08] bg-white p-5 sm:p-7">
                <dl className="m-0 divide-y divide-black/[0.06]">
                  {[
                    { label: c.profileName, value: linked.displayName || "—" },
                    { label: c.profilePhone, value: linked.phone },
                    ...(linkedSince
                      ? [{ label: c.profileSince, value: linkedSince }]
                      : []),
                  ].map((row) => (
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

              <div className="rounded-3xl bg-black/[0.03] p-5 sm:p-7">
                <h2 className="m-0 font-display text-lg font-semibold text-ink">
                  {c.supportTitle}
                </h2>
                <p className="mt-1 mb-4 text-sm text-black/55">
                  {c.supportLead}
                </p>
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
                  <Button
                    href={`tel:${SITE_CONFIG.phone}`}
                    variant="outline"
                    size="sm"
                  >
                    <Phone className="size-4" aria-hidden />
                    {SITE_CONFIG.phoneDisplay}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </PageContainer>
  );
}
