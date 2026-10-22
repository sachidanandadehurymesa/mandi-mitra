import type { MandiPriceRecord } from "@/types/domain";
import { DEMO_MANDIS } from "./mandis";

/**
 * DEMO DATASET — not live market data.
 *
 * In production, records like these are produced by the Agmarknet data
 * provider (see lib/market/provider.ts) or entered manually by an admin.
 * Each record keeps its source and fetch timestamp so the UI can show
 * provenance and flag stale data — never invented on the fly.
 */

// Base modal price per quintal (reference price, not quality-adjusted), loosely
// reflecting typical Nashik-belt onion mandi prices.
const BASE_MODAL_PRICE: Record<string, number> = {
  "lasalgaon-apmc": 1850,
  "pimpalgaon-apmc": 1790,
  "niphad-apmc": 1810,
  "yeola-apmc": 1740,
  "chandwad-apmc": 1770,
  "dindori-apmc": 1800,
  "manmad-apmc": 1690,
  "nashik-apmc": 1920,
};

function demoFetchedAt(hoursAgo: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

function toDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export function getDemoPrices(): MandiPriceRecord[] {
  return DEMO_MANDIS.map((mandi, index) => {
    // Stagger fetch times slightly so the demo shows a realistic mix of
    // "fetched a few hours ago" records, all still within the last day.
    const fetchedAt = demoFetchedAt(2 + index * 2);
    return {
      mandiId: mandi.id,
      crop: "onion",
      quality: "reference",
      modalPricePerQuintal: BASE_MODAL_PRICE[mandi.id] ?? 1750,
      minPricePerQuintal: Math.round((BASE_MODAL_PRICE[mandi.id] ?? 1750) * 0.85),
      maxPricePerQuintal: Math.round((BASE_MODAL_PRICE[mandi.id] ?? 1750) * 1.1),
      priceDate: toDateOnly(fetchedAt),
      fetchedAt,
      source: "demo-dataset",
      freshness: "demo",
      isQualityAdjusted: false,
    };
  });
}

export function getDemoPriceForMandi(mandiId: string): MandiPriceRecord | undefined {
  return getDemoPrices().find((p) => p.mandiId === mandiId);
}
