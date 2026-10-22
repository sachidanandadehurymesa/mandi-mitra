"use client";

import { useLanguage } from "@/components/providers/language-provider";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-(--color-border) bg-(--color-surface)">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-(--color-text-muted) sm:px-6">
        <p className="font-semibold text-(--color-forest)">{t.appName}</p>
        <p className="mt-1">{t.tagline}</p>
        <p className="mt-4 max-w-2xl">{t.landing.disclaimer}</p>
        <p className="mt-4 text-xs">© 2026 Mandi Mitra. Built for the Nashik–Lasalgaon onion belt, Maharashtra.</p>
      </div>
    </footer>
  );
}
