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
