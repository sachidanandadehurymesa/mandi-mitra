"use client";

/**
 * Tiny external store for the UI locale, built for useSyncExternalStore.
 * Avoids the classic "read localStorage in an effect, then setState" pattern
 * (which causes an extra render and is flagged by react-hooks/set-state-in-effect)
 * while still reading the user's saved preference and persisting changes.
 */
import type { Locale } from "./translations";

const STORAGE_KEY = "mandi-mitra-locale";
const listeners = new Set<() => void>();

let currentLocale: Locale = "en";
let hydratedFromStorage = false;

function readStoredLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "mr") return stored;
  } catch {
    // Private browsing / blocked storage — fall back to default locale.
  }
  return "en";
}

export function getLocaleSnapshot(): Locale {
  if (!hydratedFromStorage) {
    currentLocale = readStoredLocale();
    hydratedFromStorage = true;
  }
  return currentLocale;
}

export function getServerLocaleSnapshot(): Locale {
  return "en";
}

export function subscribeLocale(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  hydratedFromStorage = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Ignore storage failures; in-memory state still updates for this tab.
  }
  listeners.forEach((listener) => listener());
}
