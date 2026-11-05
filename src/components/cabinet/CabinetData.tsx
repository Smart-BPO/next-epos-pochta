"use client";

import { createContext, useContext, useEffect } from "react";
import type { Locale } from "@/i18n/config";
import { useCabinetSession } from "@/components/cabinet/CabinetSession";
import {
  useCabinetStats,
  type CabinetStats,
} from "@/components/cabinet/useCabinetStats";

const CabinetDataContext = createContext<CabinetStats | null>(null);

export function CabinetDataProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const { auth, onRelinkRequired, setTotal } = useCabinetSession();
  const stats = useCabinetStats(locale, auth, onRelinkRequired);

  useEffect(() => {
    if (stats.loaded) setTotal(stats.total);
  }, [stats.loaded, stats.total, setTotal]);

  return (
    <CabinetDataContext.Provider value={stats}>
      {children}
    </CabinetDataContext.Provider>
  );
}

export function useCabinetData() {
  const ctx = useContext(CabinetDataContext);
  if (!ctx) {
    throw new Error("useCabinetData must be used inside CabinetDataProvider");
  }
  return ctx;
}
