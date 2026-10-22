import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { ModalPriceBarChart, type MandiPricePoint } from "@/components/insights/modal-price-bar-chart";
import { MultiTrendChart, type MultiSeriesPoint } from "@/components/insights/multi-trend-chart";
import { PriceDiffChart } from "@/components/insights/price-diff-chart";
import {
  TransportVsReturnChart,
  type TransportReturnPoint,
} from "@/components/insights/transport-vs-return-chart";
import { DEMO_MANDIS } from "@/lib/data/mandis";
import { getDemoPrices } from "@/lib/data/prices";
import { getAllPriceHistories } from "@/lib/data/price-history";
import { runFullComparison } from "@/lib/services/comparison-service";

const SAMPLE_VILLAGE_ID = "lasalgaon";

export default async function InsightsPage() {
  const prices = getDemoPrices();
  const modalPriceData: MandiPricePoint[] = DEMO_MANDIS.map((m) => ({
    mandiId: m.id,
    mandiName: m.name,
    pricePerQuintal: prices.find((p) => p.mandiId === m.id)?.modalPricePerQuintal ?? 0,
  }));

  const histories = getAllPriceHistories(14);
  const dates = histories[DEMO_MANDIS[0].id]?.map((p) => p.date) ?? [];
  const trendData: MultiSeriesPoint[] = dates.map((date, i) => {
    const point: MultiSeriesPoint = { date };
    for (const mandi of DEMO_MANDIS) {
      point[mandi.name] = histories[mandi.id]?.[i]?.pricePerQuintal ?? 0;
    }
    return point;
  });

  let transportVsReturn: TransportReturnPoint[] = [];
  try {
    const breakdowns = await runFullComparison({
      crop: "onion",
      villageId: SAMPLE_VILLAGE_ID,
      quantity: 40,
      unit: "bags",
      avgWeightPerBagKg: 50,
      quality: "good",
      transportType: "tempo",
      transportRatePerKm: 25,
    });
    transportVsReturn = breakdowns.map((b) => ({
      mandiId: b.mandiId,
      mandiName: b.mandiName,
      transportCost: Math.round(b.transportCost),
      netEarnings: Math.round(b.netEarnings),
    }));
  } catch {
    transportVsReturn = [];
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-(--color-bg) py-10">
        <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-extrabold text-(--color-forest-dark)">Market Insights</h1>
            <Badge variant="demo">Showing demo data until a live market data source is configured</Badge>
          </div>

          <ModalPriceBarChart title="Onion modal prices across mandis" data={modalPriceData} />
          <MultiTrendChart
            title="Historical price trend (14 days)"
            data={trendData}
            seriesNames={DEMO_MANDIS.map((m) => m.name)}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <PriceDiffChart title="Price difference between markets" data={modalPriceData} />
            {transportVsReturn.length > 0 && (
              <TransportVsReturnChart
                title={`Transport cost vs. expected net return (sample: 40 bags from ${SAMPLE_VILLAGE_ID})`}
                data={transportVsReturn}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
