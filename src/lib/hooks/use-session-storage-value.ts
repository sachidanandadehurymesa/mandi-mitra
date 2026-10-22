"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Reads a sessionStorage value via useSyncExternalStore instead of the
 * classic useEffect+setState pattern, so there is no extra render pass and
 * no hydration mismatch (the server snapshot is always null).
 */
export function useSessionStorageValue(key: string): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return window.sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null
  );
}
