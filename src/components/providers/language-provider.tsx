"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { translations, type Locale, type TranslationShape } from "@/lib/i18n/translations";
import { getLocaleSnapshot, getServerLocaleSnapshot, setLocale, subscribeLocale } from "@/lib/i18n/locale-store";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationShape;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getServerLocaleSnapshot);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, t: translations[locale] }),
    [locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
