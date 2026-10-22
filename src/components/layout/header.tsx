"use client";

import Link from "next/link";
import { useState } from "react";
import { Sprout, Menu, X, User } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export function Header() {
  const { t, locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/compare", label: t.nav.compare },
    { href: "/insights", label: t.nav.insights },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-(--color-border) bg-(--color-surface)/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-forest) text-white">
            <Sprout size={20} />
          </span>
          <span className="text-lg font-bold text-(--color-forest)">{t.appName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-(--color-text-muted) hover:bg-black/5 hover:text-(--color-text)"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSelector locale={locale} setLocale={setLocale} label={t.common.language} />
          <Link
            href="/admin"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-(--color-text-muted) hover:bg-black/10"
            aria-label={t.nav.admin}
          >
            <User size={18} />
          </Link>
        </div>

        <button
          className="focus-ring rounded-lg p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-(--color-border) px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-(--color-text) hover:bg-black/5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-(--color-text) hover:bg-black/5"
            >
              {t.nav.admin}
            </Link>
          </nav>
          <div className="mt-3">
            <LanguageSelector locale={locale} setLocale={setLocale} label={t.common.language} />
          </div>
        </div>
      )}
    </header>
  );
}

function LanguageSelector({
  locale,
  setLocale,
  label,
}: {
  locale: "en" | "mr";
  setLocale: (l: "en" | "mr") => void;
  label: string;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-full border border-(--color-border)" aria-label={label}>
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "px-3 py-1.5 text-sm font-semibold transition-colors",
          locale === "en" ? "bg-(--color-forest) text-white" : "bg-white text-(--color-text-muted)"
        )}
      >
        English
      </button>
      <button
        onClick={() => setLocale("mr")}
        className={cn(
          "px-3 py-1.5 text-sm font-semibold transition-colors",
          locale === "mr" ? "bg-(--color-forest) text-white" : "bg-white text-(--color-text-muted)"
        )}
      >
        मराठी
      </button>
    </div>
  );
}
