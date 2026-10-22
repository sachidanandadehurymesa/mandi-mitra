"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ResultsView } from "@/components/results/results-view";
import { Button } from "@/components/ui/button";
import { useSessionStorageValue } from "@/lib/hooks/use-session-storage-value";
import type { ComparisonResult } from "@/types/domain";

const RESULT_STORAGE_KEY = "mandi-mitra-last-result";

export default function ResultsPage() {
  const raw = useSessionStorageValue(RESULT_STORAGE_KEY);
  let result: ComparisonResult | null = null;
  if (raw) {
    try {
      result = JSON.parse(raw) as ComparisonResult;
    } catch {
      result = null;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-(--color-bg) py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {!result && (
            <div className="rounded-2xl border border-(--color-border) bg-white p-10 text-center">
              <p className="text-(--color-text-muted)">
                No comparison found yet. Fill in the form to see your best mandi options.
              </p>
              <Link href="/compare" className="mt-5 inline-block">
                <Button>Go to Compare Mandis</Button>
              </Link>
            </div>
          )}
          {result && <ResultsView result={result} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
