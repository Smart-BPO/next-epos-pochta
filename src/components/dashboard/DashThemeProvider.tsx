"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type DashTheme = "light" | "dark" | "system";

type Ctx = {
  theme: DashTheme;
  resolved: "light" | "dark";
  setTheme: (theme: DashTheme) => void;
};

const DashThemeContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "dash-theme";
const THEME_EVENT = "dash-theme-change";

function subscribeTheme(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onStoreChange();
  };
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onStoreChange);
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_EVENT, onStoreChange);
  return () => {
    mq.removeEventListener("change", onStoreChange);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_EVENT, onStoreChange);
  };
}

function readTheme(): DashTheme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // ignore
  }
  return "system";
}

function systemDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(theme: DashTheme): "light" | "dark" {
  if (theme === "system") return systemDark() ? "dark" : "light";
  return theme;
}

export function DashThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readTheme,
    (): DashTheme => "system",
  );
  const resolved = useSyncExternalStore(
    subscribeTheme,
    (): "light" | "dark" => resolve(readTheme()),
    (): "light" | "dark" => "light",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-dash-theme", resolved);
  }, [resolved]);

  const setTheme = useCallback((next: DashTheme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new Event(THEME_EVENT));
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  return (
    <DashThemeContext.Provider value={value}>
      {children}
    </DashThemeContext.Provider>
  );
}

export function useDashTheme() {
  const ctx = useContext(DashThemeContext);
  if (!ctx) {
    throw new Error("useDashTheme must be used within DashThemeProvider");
  }
  return ctx;
}
