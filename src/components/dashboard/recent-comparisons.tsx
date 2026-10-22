"use client";

import Link from "next/link";
import { Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { useSessionStorageValue } from "@/lib/hooks/use-session-storage-value";
import type { ComparisonResult } from "@/types/domain";

const RESULT_STORAGE_KEY = "mandi-mitra-last-result";

export function RecentComparisons() {
  const { t } = useLanguage();
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
    <Card>
      <CardHeader>
        <CardTitle>{t.dashboard.recentComparisons}</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {!result ? (
          <div className="flex flex-col items-start gap-3 text-sm text-(--color-text-muted)">
            <p>{t.dashboard.noComparisonsYet}</p>
            <Link href="/compare">
              <Button size="sm">{t.dashboard.compareButton}</Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-green-light) text-(--color-forest)">
                <Clock3 size={16} />
              </span>
              <div>
                <p className="font-semibold">{result.ranked[0]?.mandiName}</p>
                <p className="text-xs text-(--color-text-muted)">
                  {new Date(result.computedAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-(--color-forest)">
                {formatINR(Math.round(result.ranked[0]?.netEarnings ?? 0))}
              </p>
              <Link href="/compare/results" className="text-xs text-(--color-forest) underline">
                View
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
