import Link from "next/link";
import { ArrowRight, Award, LayoutGrid, TrendingUp, Wallet } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { PriceTrendChart } from "@/components/dashboard/price-trend-chart";
import { NearbyMandiCard } from "@/components/dashboard/nearby-mandi-card";
import { RecentComparisons } from "@/components/dashboard/recent-comparisons";
import { runComparison } from "@/lib/services/comparison-service";
import { DEMO_MANDIS } from "@/lib/data/mandis";
import { getDemoDistances } from "@/lib/data/distances";
import { getDemoPrices } from "@/lib/data/prices";
import { getPriceHistory } from "@/lib/data/price-history";
import { formatINR } from "@/lib/utils";
import type { ComparisonResult } from "@/types/domain";

const DEFAULT_VILLAGE_ID = "lasalgaon";

export default async function DashboardPage() {
  let sample: ComparisonResult | null = null;
  try {
    sample = await runComparison({
      crop: "onion",
      villageId: DEFAULT_VILLAGE_ID,
      quantity: 40,
      unit: "bags",
      avgWeightPerBagKg: 50,
      quality: "good",
      transportType: "tempo",
      transportRatePerKm: 25,
    });
  } catch {
    sample = null;
  }

  const distances = getDemoDistances()
    .filter((d) => d.villageId === DEFAULT_VILLAGE_ID)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 5);
  const prices = getDemoPrices();
  const topMandiId = sample?.ranked[0]?.mandiId ?? DEMO_MANDIS[0].id;
  const trend = getPriceHistory(topMandiId, 14);
  const topMandiName = DEMO_MANDIS.find((m) => m.id === topMandiId)?.name ?? "";

  const representativePrice =
    prices.find((p) => p.mandiId === topMandiId)?.modalPricePerQuintal ?? prices[0]?.modalPricePerQuintal ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-(--color-bg) py-10">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-extrabold text-(--color-forest-dark)">Dashboard</h1>
            <Link href="/compare">
              <Button size="lg">
                Compare Mandis <ArrowRight size={18} />
              </Button>
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={TrendingUp}
              label="Current onion modal price"
              value={formatINR(representativePrice)}
              sublabel={topMandiName}
            />
            <StatCard
              icon={Award}
              label="Best estimated mandi today"
              value={sample?.ranked[0]?.mandiName ?? "—"}
              sublabel={sample ? `${formatINR(Math.round(sample.ranked[0].netEarnings))} net` : undefined}
            />
            <StatCard
              icon={Wallet}
              label="Potential additional earnings"
              value={formatINR(Math.round(sample?.additionalEarningsVsNearest ?? 0))}
              sublabel="vs. nearest mandi, sample 40 bags"
            />
            <StatCard
              icon={LayoutGrid}
              label="Mandis compared"
              value={String(distances.length)}
              sublabel={`out of ${DEMO_MANDIS.length} in network`}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PriceTrendChart title={`${topMandiName} — price trend (14 days)`} data={trend} />
            </div>
            <RecentComparisons />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Nearby mandi prices</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
              {distances.map((d) => {
                const mandi = DEMO_MANDIS.find((m) => m.id === d.mandiId);
                const price = prices.find((p) => p.mandiId === d.mandiId);
                if (!mandi || !price) return null;
                return (
                  <NearbyMandiCard
                    key={d.mandiId}
                    name={mandi.name}
                    distanceKm={d.distanceKm}
                    pricePerQuintal={price.modalPricePerQuintal}
                    priceDate={price.priceDate}
                    freshness={price.freshness}
                  />
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
