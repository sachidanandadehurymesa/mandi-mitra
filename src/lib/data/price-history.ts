/**
 * DEMO DATA. Deterministic synthetic price history so the Market Insights
 * and Dashboard charts have something to render before a real time-series
 * price feed is connected. Seeded (not Math.random) so server and client
 * render the same values and avoid hydration mismatches.
 */
import { DEMO_MANDIS } from "./mandis";

function seededNoise(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x); // 0..1
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export interface PriceHistoryPoint {
  date: string; // YYYY-MM-DD
  pricePerQuintal: number;
}

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

/** Generates `days` of daily modal-price history ending today, for one mandi. */
export function getPriceHistory(mandiId: string, days = 14): PriceHistoryPoint[] {
  const base = BASE_MODAL_PRICE[mandiId] ?? 1750;
  const seed = hashString(mandiId);
  const points: PriceHistoryPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const noise = seededNoise(seed + i * 7.13) - 0.5; // -0.5..0.5
    const drift = Math.sin((seed % 100) + i / 3) * 0.03; // gentle wave
    const price = Math.round(base * (1 + drift + noise * 0.04));
    points.push({ date: d.toISOString().slice(0, 10), pricePerQuintal: price });
  }
  return points;
}

/** All mandis' price history, keyed by mandiId — convenient for multi-series charts. */
export function getAllPriceHistories(days = 14): Record<string, PriceHistoryPoint[]> {
  const out: Record<string, PriceHistoryPoint[]> = {};
  for (const mandi of DEMO_MANDIS) {
    out[mandi.id] = getPriceHistory(mandi.id, days);
  }
  return out;
}
