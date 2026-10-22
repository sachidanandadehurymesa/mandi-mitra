import { Award, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatDateDMY } from "@/lib/utils";
import type { ComparisonResult } from "@/types/domain";

export function SampleComparison({ result }: { result: ComparisonResult }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold text-(--color-forest-dark)">Sample comparison</h2>
        <Badge variant="demo">DEMO DATA — illustrative example, not a live quote</Badge>
      </div>
      <p className="mt-2 text-(--color-text-muted)">
        40 bags of good-quality onions from Lasalgaon, computed by the same engine that powers the
        comparison tool.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {result.ranked.map((m, i) => (
          <Card key={m.mandiId} className={i === 0 ? "ring-2 ring-(--color-gold)" : undefined}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                    Rank {i + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{m.mandiName}</h3>
                </div>
                {i === 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-(--color-gold) px-2 py-1 text-xs font-bold text-(--color-forest-dark)">
                    <Award size={14} /> BEST
                  </span>
                )}
              </div>
              <p className="mt-3 flex items-center gap-1 text-sm text-(--color-text-muted)">
                <MapPin size={14} /> {m.distanceKm} km away
              </p>
              <p className="mt-4 text-2xl font-extrabold text-(--color-forest)">
                {formatINR(Math.round(m.netEarnings))}
              </p>
              <p className="text-sm text-(--color-text-muted)">expected net earnings</p>
              <div className="mt-4 space-y-1 border-t border-(--color-border) pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-(--color-text-muted)">Transport cost</span>
                  <span>{formatINR(Math.round(m.transportCost))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--color-text-muted)">Mandi charges</span>
                  <span>{formatINR(Math.round(m.totalMandiCharges))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--color-text-muted)">Price date</span>
                  <span>{formatDateDMY(m.priceDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {result.additionalEarningsVsNearest > 0 && (
        <p className="mt-6 text-center text-(--color-text-muted)">
          Additional earnings vs. nearest mandi:{" "}
          <span className="font-bold text-(--color-forest)">
            {formatINR(Math.round(result.additionalEarningsVsNearest))}
          </span>
        </p>
      )}
      <p className="mt-4 text-center text-sm text-(--color-text-muted)">
        All figures above are illustrative examples, not actual market data.
      </p>
    </section>
  );
}
