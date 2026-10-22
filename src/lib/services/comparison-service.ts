import "server-only";
import type {
  ComparisonInput,
  ComparisonResult,
  Mandi,
  MandiCalculationBreakdown,
  MandiCharges,
  MandiDistance,
  MandiPriceRecord,
} from "@/types/domain";
import { rankMandis, calculateMandiBreakdown, CalculationValidationError } from "@/lib/calc/engine";
import { DEMO_MANDIS } from "@/lib/data/mandis";
import { getDemoDistances } from "@/lib/data/distances";
import { getDemoCharges } from "@/lib/data/charges";
import { getActiveProviders, computeFreshness } from "@/lib/market/provider";

interface MandiBundle {
  mandi: Mandi;
  distance: MandiDistance;
  priceRecord: MandiPriceRecord;
  charges: MandiCharges;
}

async function buildBundlesForVillage(villageId: string): Promise<MandiBundle[]> {
  const distances = getDemoDistances().filter((d) => d.villageId === villageId);
  const charges = getDemoCharges();

  // Merge all configured providers' latest prices, preferring the first
  // provider (highest priority) that has a record for each mandi.
  const providers = getActiveProviders();
  const priceByMandi = new Map<string, MandiPriceRecord>();
  for (const provider of providers) {
    const records = await provider.getAllLatestPrices("onion");
    for (const record of records) {
      if (!priceByMandi.has(record.mandiId)) {
        priceByMandi.set(record.mandiId, { ...record, freshness: computeFreshness(record) });
      }
    }
  }

  return distances
    .map((distance) => {
      const mandi = DEMO_MANDIS.find((m) => m.id === distance.mandiId);
      const priceRecord = priceByMandi.get(distance.mandiId);
      const mandiCharges = charges.find((c) => c.mandiId === distance.mandiId);
      if (!mandi || !priceRecord || !mandiCharges) return null;
      return { mandi, distance, priceRecord, charges: mandiCharges };
    })
    .filter((b): b is MandiBundle => b !== null);
}

/**
 * Orchestrates the end-to-end comparison: pulls distances, charges and the
 * best available price per mandi, then hands everything to the deterministic
 * calculation engine. This is the single entry point the API route (and,
 * later, the WhatsApp bot) should call — nobody else should call the engine
 * directly with hand-assembled data. Returns the top 3 mandis only.
 */
export async function runComparison(input: ComparisonInput): Promise<ComparisonResult> {
  const bundles = await buildBundlesForVillage(input.villageId);
  if (bundles.length === 0) {
    throw new CalculationValidationError([
      "No mandi price or distance data is available for the selected village yet.",
    ]);
  }
  return rankMandis(input, bundles);
}

/**
 * Same inputs as runComparison, but returns every mandi's breakdown (sorted
 * by net earnings, best first) instead of just the top 3. Used by the Market
 * Insights page, which needs the full picture rather than a farmer-facing
 * top-3 result.
 */
export async function runFullComparison(input: ComparisonInput): Promise<MandiCalculationBreakdown[]> {
  const bundles = await buildBundlesForVillage(input.villageId);
  return bundles
    .map((bundle) => calculateMandiBreakdown(input, bundle))
    .sort((a, b) => b.netEarnings - a.netEarnings);
}
