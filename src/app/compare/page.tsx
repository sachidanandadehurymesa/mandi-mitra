"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CompareForm } from "@/components/compare/compare-form";
import { useLanguage } from "@/components/providers/language-provider";

export default function ComparePage() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-(--color-bg) py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold text-(--color-forest-dark)">{t.compare.title}</h1>
          <p className="mt-2 text-(--color-text-muted)">{t.compare.subtitle}</p>
          <div className="mt-8">
            <CompareForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
