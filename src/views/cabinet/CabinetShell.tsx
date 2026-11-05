"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  MapPinned,
  Package,
  PackagePlus,
  ShieldCheck,
  UserRound,
  Zap,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { cabinetCopy } from "@/data/cabinet";
import { accountCopy } from "@/data/account-copy";
import { PageContainer } from "@/components/atoms/PageContainer";
import { AccountOtpLink, type AccountLinked } from "@/components/account";
import { cn } from "@/lib/cn";

type Session =
  | { state: "loading" }
  | { state: "guest"; error?: string | null }
  | { state: "linked"; linked: AccountLinked };

type CabinetContextValue = {
  locale: Locale;
  linked: AccountLinked;
  auth: { kind: "cookie" };
  logout: () => Promise<void>;
  loggingOut: boolean;
  onRelinkRequired: () => void;
  setTotal: (total: number | null) => void;
  createdTracking: string | null;
  setCreatedTracking: (tracking: string | null) => void;
};

const CabinetContext = createContext<CabinetContextValue | null>(null);

export function useCabinet() {
  const ctx = useContext(CabinetContext);
  if (!ctx) throw new Error("useCabinet must be used inside CabinetShell");
  return ctx;
}

export function cabinetHref(locale: Locale, sub = "") {
  return localePath(locale, `/cabinet/${sub}`);
}

export function cabinetShipmentHref(locale: Locale, tracking: string) {
  return cabinetHref(locale, `shipments/${encodeURIComponent(tracking)}/`);
}

function initials(linked: AccountLinked) {
  const name = linked.displayName?.trim();
  if (name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("");
  }
  return linked.phone.replace(/\D/g, "").slice(-2);
}

function stripSlash(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function CabinetShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const c = cabinetCopy(locale);
  const a = accountCopy(locale);
  const router = useRouter();
  const pathname = stripSlash(usePathname() ?? "");
  const auth = useMemo(() => ({ kind: "cookie" as const }), []);

  const [session, setSession] = useState<Session>({ state: "loading" });
  const [total, setTotal] = useState<number | null>(null);
  const [createdTracking, setCreatedTracking] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

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
        setSession(
          json.linked
            ? { state: "linked", linked: json.linked }
            : {
                state: "guest",
                error:
                  json.error === "relink_required" ? a.relinkRequired : null,
              },
        );
      } catch {
        if (!cancelled) setSession({ state: "guest" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [a.relinkRequired]);

  const resetLocal = useCallback(() => {
    setTotal(null);
    setCreatedTracking(null);
  }, []);

  const onRelinkRequired = useCallback(() => {
    setSession({ state: "guest", error: a.relinkRequired });
    resetLocal();
  }, [a.relinkRequired, resetLocal]);

  const logout = useCallback(async () => {
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
      resetLocal();
      setLoggingOut(false);
      router.replace(cabinetHref(locale));
    }
  }, [locale, resetLocal, router]);

  const ctx = useMemo<CabinetContextValue | null>(
    () =>
      session.state === "linked"
        ? {
            locale,
            linked: session.linked,
            auth,
            logout,
            loggingOut,
            onRelinkRequired,
            setTotal,
            createdTracking,
            setCreatedTracking,
          }
        : null,
    [
      session,
      locale,
      auth,
      logout,
      loggingOut,
      onRelinkRequired,
      createdTracking,
    ],
  );

  if (session.state === "loading") {
    return (
      <PageContainer className="py-8 sm:py-12">
        <div
          className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[260px_minmax(0,1fr)]"
          aria-busy
        >
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

  if (session.state === "guest" || !ctx) {
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
              initialError={session.state === "guest" ? session.error ?? null : null}
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

  const { linked } = ctx;
  const root = stripSlash(cabinetHref(locale));
  const nav = [
    {
      href: cabinetHref(locale),
      label: c.navShipments,
      icon: Package,
      active:
        pathname === root || pathname.startsWith(`${root}/shipments`),
    },
    { href: cabinetHref(locale, "new/"), label: c.navNew, icon: PackagePlus },
    {
      href: cabinetHref(locale, "tracking/"),
      label: c.navTrack,
      icon: MapPinned,
    },
    {
      href: cabinetHref(locale, "profile/"),
      label: c.navProfile,
      icon: UserRound,
    },
  ].map((item) => ({
    ...item,
    active: item.active ?? pathname === stripSlash(item.href),
  }));

  return (
    <CabinetContext.Provider value={ctx}>
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
              {nav.map(({ href, label, icon: Icon, active }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-semibold no-underline transition lg:w-full",
                    active
                      ? "bg-primary text-white"
                      : "bg-white text-black/65 ring-1 ring-black/[0.08] hover:text-ink lg:bg-transparent lg:ring-0 lg:hover:bg-black/[0.04]",
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden />
                  {label}
                </Link>
              ))}
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

          <div className="min-w-0">{children}</div>
        </div>
      </PageContainer>
    </CabinetContext.Provider>
  );
}
