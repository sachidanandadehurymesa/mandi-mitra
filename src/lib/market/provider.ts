/**
 * Market data provider abstraction.
 *
 * Mandi Mitra is designed to plug into the Government of India's Agmarknet
 * data (served via data.gov.in APIs) once an API key is configured. Until
 * then, every call falls back to the clearly-labeled demo dataset.
 *
 * IMPORTANT:
 *  - This module never silently replaces a missing *live* price with a demo
 *    price inside a provider that claims to be live — each provider returns
 *    its own, correctly-labeled records, and the caller decides how to
 *    combine them (see getBestAvailablePrice below, which is explicit about
 *    which tier it used).
 *  - API credentials are read from environment variables only. Never from
 *    client code, never hardcoded.
 */
import "server-only";
import type { DataFreshness, MandiPriceRecord } from "@/types/domain";
import { getDemoPriceForMandi, getDemoPrices } from "@/lib/data/prices";

const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface MarketDataProvider {
  readonly name: "agmarknet" | "demo";
  getLatestPrice(mandiId: string, crop: "onion"): Promise<MandiPriceRecord | null>;
  getAllLatestPrices(crop: "onion"): Promise<MandiPriceRecord[]>;
}

/** Recomputes freshness from the record's age rather than trusting a stored flag. */
export function computeFreshness(record: MandiPriceRecord): DataFreshness {
  if (record.source === "demo-dataset") return "demo";
  const ageMs = Date.now() - new Date(record.fetchedAt).getTime();
  if (ageMs > STALE_AFTER_MS) return "stale";
  return record.source === "agmarknet" ? "live" : "cached";
}

export class DemoMarketDataProvider implements MarketDataProvider {
  readonly name = "demo" as const;

  async getLatestPrice(mandiId: string): Promise<MandiPriceRecord | null> {
    const record = getDemoPriceForMandi(mandiId);
    return record ? { ...record, freshness: computeFreshness(record) } : null;
  }

  async getAllLatestPrices(): Promise<MandiPriceRecord[]> {
    return getDemoPrices().map((r) => ({ ...r, freshness: computeFreshness(r) }));
  }
}

/**
 * Agmarknet / data.gov.in provider.
 *
 * NOT CONNECTED YET. This is scaffolding for a real integration:
 *   1. Set AGMARKNET_API_KEY and AGMARKNET_RESOURCE_ID in your environment.
 *   2. Implement the fetch + normalization below against the data.gov.in
 *      resource for Agmarknet variety-wise daily market prices.
 *   3. Map the response's state/district/market/commodity fields onto our
 *      `Mandi` records (see lib/data/mandis.ts) and persist normalized rows
 *      with their source + fetchedAt timestamp (ideally into mandi_prices).
 *
 * Until implemented, every call returns null so callers fall back to the
 * demo provider explicitly and visibly, rather than pretending to be live.
 */
export class AgmarknetProvider implements MarketDataProvider {
  readonly name = "agmarknet" as const;

  private get apiKey(): string | undefined {
    return process.env.AGMARKNET_API_KEY;
  }

  private get resourceId(): string | undefined {
    return process.env.AGMARKNET_RESOURCE_ID;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.resourceId);
  }

  async getLatestPrice(_mandiId: string, _crop: "onion"): Promise<MandiPriceRecord | null> {
    if (!this.isConfigured()) return null;
    // TODO: call https://api.data.gov.in/resource/{resourceId}?api-key={apiKey}
    // normalize the response into a MandiPriceRecord, and return it.
    // On any HTTP error, timeout, or malformed payload: log and return null
    // (never throw into the UI, and never fabricate a value).
    return null;
  }

  async getAllLatestPrices(_crop: "onion"): Promise<MandiPriceRecord[]> {
    if (!this.isConfigured()) return [];
    return [];
  }
}

/**
 * Returns the provider the app should use right now. Prefers Agmarknet when
 * configured; the demo provider is always available as a fallback so the
 * product keeps working end-to-end without credentials.
 */
export function getActiveProviders(): MarketDataProvider[] {
  const agmarknet = new AgmarknetProvider();
  const demo = new DemoMarketDataProvider();
  return agmarknet.isConfigured() ? [agmarknet, demo] : [demo];
}

/**
 * Tries providers in priority order and returns the first hit, tagging the
 * result with which tier actually served it. Never mixes a live provider's
 * "shape" with demo data — if Agmarknet has nothing, we say so and fall
 * back visibly to the demo dataset.
 */
export async function getBestAvailablePrice(
  mandiId: string,
  crop: "onion" = "onion"
): Promise<MandiPriceRecord | null> {
  for (const provider of getActiveProviders()) {
    const record = await provider.getLatestPrice(mandiId, crop);
    if (record) return record;
  }
  return null;
}
