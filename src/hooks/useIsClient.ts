"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** False during SSR and hydration, true afterwards — without a mount effect. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function subscribeMediaQuery(query: string, onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

/**
 * Media-query subscription with stable boolean snapshots.
 * Subscribe is recreated when `query` changes (intentional).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribeMediaQuery(query, onStoreChange),
    () =>
      typeof window !== "undefined"
        ? window.matchMedia(query).matches
        : false,
    () => false,
  );
}
