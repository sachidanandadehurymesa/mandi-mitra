"use client";

import { Award, CalendarClock, MapPin, Printer, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { formatINR, formatDateDMY } from "@/lib/utils";
import type { ComparisonResult, DataFreshness, MandiCalculationBreakdown } from "@/types/domain";
import { useRouter } from "next/navigation";

function freshnessVariant(freshness: DataFreshness): "live" | "demo" | "stale" | "neutral" {
  if (freshness === "live") return "live";
  if (freshness === "demo") return "demo";
  if (freshness === "stale") return "stale";
  return "neutral";
}

export function ResultsView({ result }: { result: ComparisonResult }) {
  const { t, locale } = useLanguage();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-(--color-forest-dark)">{t.results.title}</h1>
        <div className="flex gap-2 print:hidden">
          <Button variant="secondary" onClick={() => router.push("/compare")}>
            <RefreshCcw size={16} /> {t.results.compareAgain}
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={16} /> {t.results.print}
          </Button>
        </div>
      </div>

      {result.additionalEarningsVsNearest > 0 && (
        <Card className="border-(--color-gold)/40 bg-(--color-gold)/10">
          <CardContent className="p-5 text-(--color-forest-dark)">
            <span className="font-semibold">{t.results.additionalEarnings}:</span>{" "}
            <span className="text-lg font-extrabold">
              {formatINR(Math.round(result.additionalEarningsVsNearest))}
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {result.ranked.map((breakdown, i) => (
          <ResultCard key={breakdown.mandiId} breakdown={breakdown} rank={i + 1} locale={locale} t={t} />
        ))}
      </div>

      <p className="text-center text-sm text-(--color-text-muted)">{t.results.illustrativeNote}</p>
    </div>
  );
}

function ResultCard({
  breakdown,
  rank,
  locale,
  t,
}: {
  breakdown: MandiCalculationBreakdown;
  rank: number;
  locale: "en" | "mr";
  t: ReturnType<typeof useLanguage>["t"];
}) {
  const isBest = rank === 1;
  return (
    <Card className={isBest ? "relative ring-2 ring-(--color-gold)" : "relative"}>
      {isBest && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="best" className="shadow">
            <Award size={14} /> {t.results.bestBadge}
          </Badge>
        </div>
      )}
      <CardContent className="p-5 pt-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
          {t.results.rank} {rank}
        </p>
        <h3 className="mt-1 text-xl font-bold">
          {locale === "mr" ? breakdown.mandiNameMr : breakdown.mandiName}
        </h3>
        <p className="mt-2 flex items-center gap-1 text-sm text-(--color-text-muted)">
          <MapPin size={14} /> {breakdown.distanceKm} km
        </p>

        <p className="mt-4 text-3xl font-extrabold text-(--color-forest)">
          {formatINR(Math.round(breakdown.netEarnings))}
        </p>
        <p className="text-sm text-(--color-text-muted)">{t.results.netEarnings}</p>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-(--color-green-light) px-3 py-2 text-sm">
          <span className="text-(--color-text-muted)">{t.results.netEarningsPerQuintal}</span>
          <span className="font-semibold text-(--color-forest-dark)">
            {formatINR(Math.round(breakdown.netEarningsPerQuintal))}
          </span>
        </div>

        <div className="mt-4 space-y-2 border-t border-(--color-border) pt-4">
          <p className="text-xs font-semibold text-(--color-text-muted)">{t.results.breakdownTitle}</p>
          <BreakdownRow label={t.results.modalPrice} value={formatINR(Math.round(breakdown.pricePerQuintal))} />
          <BreakdownRow label="Quantity (quintals)" value={breakdown.quantityQuintals.toFixed(2)} />
          <BreakdownRow label={t.results.transportCost} value={`− ${formatINR(Math.round(breakdown.transportCost))}`} />
          <BreakdownRow label={t.results.mandiCharges} value={`− ${formatINR(Math.round(breakdown.totalMandiCharges))}`} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-(--color-border) pt-4 text-xs text-(--color-text-muted)">
          <CalendarClock size={14} />
          <span>
            {t.results.priceDate}: {formatDateDMY(breakdown.priceDate)}
          </span>
          <Badge variant={freshnessVariant(breakdown.freshness)}>{breakdown.freshness.toUpperCase()}</Badge>
        </div>
        <p className="mt-2 text-xs text-(--color-text-muted)">
          {t.results.source}: {breakdown.priceSource}
          {!breakdown.priceIsQualityAdjusted &&
            " — reference market price, not grade-adjusted for your exact onion quality."}
        </p>
      </CardContent>
    </Card>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-(--color-text-muted)">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
