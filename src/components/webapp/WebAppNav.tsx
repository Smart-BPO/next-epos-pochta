"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WebAppTabId = "calc" | "ship" | "track" | "profile";

export type ShipmentDraft = {
  from: string;
  to: string;
  weight: string;
  length: string;
  width: string;
  height: string;
};

type WebAppNavContextValue = {
  tab: WebAppTabId;
  setTab: (tab: WebAppTabId) => void;
  draft: ShipmentDraft | null;
  setDraft: (draft: ShipmentDraft | null) => void;
  highlightShipmentId: string | null;
  setHighlightShipmentId: (id: string | null) => void;
};

const WebAppNavContext = createContext<WebAppNavContextValue | null>(null);

const TAB_IDS: WebAppTabId[] = ["calc", "ship", "track", "profile"];

export function parseWebAppTab(raw: string | null | undefined): WebAppTabId {
  if (raw && (TAB_IDS as string[]).includes(raw)) return raw as WebAppTabId;
  return "calc";
}

function replaceTabInUrl(tab: WebAppTabId) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  // Preserve existing query (e.g. lang=) while updating tab.
  const qs = url.searchParams.toString();
  window.history.replaceState(null, "", qs ? `${url.pathname}?${qs}` : url.pathname);
}

export function WebAppNavProvider({
  initialTab = "calc",
  children,
}: {
  initialTab?: WebAppTabId;
  children: ReactNode;
}) {
  const [tab, setTabState] = useState<WebAppTabId>(initialTab);
  const [draft, setDraft] = useState<ShipmentDraft | null>(null);
  const [highlightShipmentId, setHighlightShipmentId] = useState<string | null>(
    null,
  );

  const setTab = useCallback((next: WebAppTabId) => {
    setTabState(next);
    replaceTabInUrl(next);
  }, []);

  const value = useMemo(
    () => ({
      tab,
      setTab,
      draft,
      setDraft,
      highlightShipmentId,
      setHighlightShipmentId,
    }),
    [tab, setTab, draft, highlightShipmentId],
  );

  return (
    <WebAppNavContext.Provider value={value}>{children}</WebAppNavContext.Provider>
  );
}

export function useWebAppNav() {
  const ctx = useContext(WebAppNavContext);
  if (!ctx) throw new Error("useWebAppNav must be used within WebAppNavProvider");
  return ctx;
}
