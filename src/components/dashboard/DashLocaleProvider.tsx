"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useOptimistic,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  dashFormat,
  getDashCopy,
  type DashCopy,
  type DashLocale,
} from "@/i18n/dashboard";
import { setDashLocaleAction } from "@/app/dashboard/(app)/locale/actions";

type DashLocaleContextValue = {
  locale: DashLocale;
  copy: DashCopy;
  setLocale: (locale: DashLocale) => void;
  format: (template: string, vars: Record<string, string | number>) => string;
  pending: boolean;
};

const DashLocaleContext = createContext<DashLocaleContextValue | null>(null);

export function DashLocaleProvider({
  locale: initialLocale,
  children,
}: {
  locale: DashLocale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [locale, setOptimisticLocale] = useOptimistic(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale === "ru" ? "ru" : "uz";
  }, [locale]);

  const setLocale = useCallback(
    (next: DashLocale) => {
      startTransition(async () => {
        setOptimisticLocale(next);
        await setDashLocaleAction(next);
        router.refresh();
      });
    },
    [router, setOptimisticLocale],
  );

  const value = useMemo<DashLocaleContextValue>(() => {
    const copy = getDashCopy(locale);
    return {
      locale,
      copy,
      setLocale,
      format: dashFormat,
      pending,
    };
  }, [locale, setLocale, pending]);

  return (
    <DashLocaleContext.Provider value={value}>
      {children}
    </DashLocaleContext.Provider>
  );
}

export function useDashLocale() {
  const ctx = useContext(DashLocaleContext);
  if (!ctx) {
    throw new Error("useDashLocale must be used within DashLocaleProvider");
  }
  return ctx;
}

/** Shorthand: returns copy dictionary for the current dashboard locale. */
export function useDashT() {
  return useDashLocale().copy;
}
