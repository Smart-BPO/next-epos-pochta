"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { accountCopy } from "@/data/account-copy";
import type { AccountLinked } from "@/components/account";
import { cabinetHref } from "@/components/cabinet/nav";

export type CabinetSessionState =
  | { state: "loading" }
  | { state: "guest"; error?: string | null }
  | { state: "linked"; linked: AccountLinked };

type CabinetSessionValue = {
  locale: Locale;
  linked: AccountLinked;
  auth: { kind: "cookie" };
  logout: () => Promise<void>;
  loggingOut: boolean;
  onRelinkRequired: () => void;
  setTotal: (total: number | null) => void;
  total: number | null;
  createdTracking: string | null;
  setCreatedTracking: (tracking: string | null) => void;
};

const CabinetSessionContext = createContext<CabinetSessionValue | null>(null);

export function useCabinetSession() {
  const ctx = useContext(CabinetSessionContext);
  if (!ctx) {
    throw new Error("useCabinetSession must be used inside linked CabinetShell");
  }
  return ctx;
}

/** Slide local idle cookie while cabinet tab stays open. */
const CABINET_REFRESH_MS = 15 * 60_000;
/** Ignore rapid tab focus churn — still slide on the interval. */
const CABINET_VISIBILITY_REFRESH_MIN_MS = 2 * 60_000;

export function useCabinetSessionProbe(locale: Locale) {
  const a = accountCopy(locale);
  const router = useRouter();
  const auth = useMemo(() => ({ kind: "cookie" as const }), []);
  const [session, setSession] = useState<CabinetSessionState>({
    state: "loading",
  });
  const [total, setTotal] = useState<number | null>(null);
  const [createdTracking, setCreatedTracking] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const resetLocal = useCallback(() => {
    setTotal(null);
    setCreatedTracking(null);
  }, []);

  const onRelinkRequired = useCallback(() => {
    setSession({ state: "guest", error: a.relinkRequired });
    resetLocal();
  }, [a.relinkRequired, resetLocal]);

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
            : { state: "guest" },
        );
      } catch {
        if (!cancelled) setSession({ state: "guest" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (session.state !== "linked") return;

    let cancelled = false;
    let lastRefreshAt = 0;
    const refresh = async (reason: "interval" | "visible") => {
      const now = Date.now();
      if (
        reason === "visible" &&
        now - lastRefreshAt < CABINET_VISIBILITY_REFRESH_MIN_MS
      ) {
        return;
      }
      lastRefreshAt = now;
      try {
        const res = await fetch("/api/account/refresh/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
          cache: "no-store",
        });
        const json = (await res.json()) as {
          linked?: AccountLinked | null;
          error?: string;
        };
        if (cancelled) return;
        // Refresh no longer revokes on dead FCargo bearer. Only drop the
        // UI session when the local cookie/link is truly gone.
        if (json.error === "not_linked" || res.status === 401) {
          if (json.error === "relink_required") {
            onRelinkRequired();
            return;
          }
          setSession({ state: "guest" });
          resetLocal();
          return;
        }
        if (!res.ok || !json.linked) {
          // Transient failure — keep current linked UI.
          return;
        }
        setSession({ state: "linked", linked: json.linked });
      } catch {
        // keep current session on transient network errors
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh("visible");
    };

    const timer = window.setInterval(
      () => void refresh("interval"),
      CABINET_REFRESH_MS,
    );
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [session.state, onRelinkRequired, resetLocal]);

  const logout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/account/logout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
    } catch {
      // cookie cleared server-side
    } finally {
      setSession({ state: "guest" });
      resetLocal();
      setLoggingOut(false);
      router.replace(cabinetHref(locale));
    }
  }, [locale, resetLocal, router]);

  const value = useMemo<CabinetSessionValue | null>(
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
            total,
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
      total,
      createdTracking,
    ],
  );

  return { session, setSession, auth, value };
}

export function CabinetSessionProvider({
  value,
  children,
}: {
  value: CabinetSessionValue;
  children: React.ReactNode;
}) {
  return (
    <CabinetSessionContext.Provider value={value}>
      {children}
    </CabinetSessionContext.Provider>
  );
}
