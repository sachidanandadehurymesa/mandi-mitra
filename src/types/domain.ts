// Core domain types shared across the calculation engine, data providers, and UI.

export type OnionQuality = "good" | "medium" | "low";
export type TransportType = "tractor" | "tempo" | "truck";
export type QuantityUnit = "bags" | "quintals";

export type DataFreshness = "live" | "cached" | "demo" | "stale";

export interface Village {
  id: string;
  name: string;
  nameMr: string;
  taluka: string;
  district: string;
}

export interface Mandi {
  id: string;
  name: string;
  nameMr: string;
  taluka: string;
  district: string;
}

export interface MandiDistance {
  villageId: string;
  mandiId: string;
  distanceKm: number; // one-way distance, used to derive round trip
}

/**
 * A single price observation for a crop at a mandi.
 * `source` and `fetchedAt` must always be recorded so the UI can show
 * provenance and flag stale data (see market-data-provider.ts).
 */
export interface MandiPriceRecord {
  mandiId: string;
  crop: "onion";
  quality: OnionQuality | "reference";
  modalPricePerQuintal: number;
  minPricePerQuintal?: number;
  maxPricePerQuintal?: number;
  priceDate: string; // ISO date the price was recorded in the market
  fetchedAt: string; // ISO timestamp we obtained/entered this record
  source: "agmarknet" | "manual-admin" | "demo-dataset";
  freshness: DataFreshness;
  isQualityAdjusted: boolean;
}

export interface MandiCharges {
  mandiId: string;
  /** Percentage of sale value charged as mandi/commission fee, e.g. 0.06 = 6% */
  commissionRate: number;
  /** Flat per-quintal handling/hamali charge, in rupees */
  handlingChargePerQuintal: number;
  /** Flat weighing/cess charge per transaction, in rupees */
  cessFlat: number;
  notes?: string;
}

export interface TransportRateConfig {
  type: TransportType;
  label: string;
  labelMr: string;
  defaultRatePerKm: number;
  /** Approximate quintal capacity, used only for guidance in the UI */
  typicalCapacityQuintals: number;
}

export interface ComparisonInput {
  crop: "onion";
  villageId: string;
  quantity: number;
  unit: QuantityUnit;
  avgWeightPerBagKg: number;
  quality: OnionQuality;
  transportType: TransportType;
  transportRatePerKm: number;
  notes?: string;
}

export interface MandiCalculationBreakdown {
  mandiId: string;
  mandiName: string;
  mandiNameMr: string;
  distanceKm: number;
  roundTripKm: number;
  quantityQuintals: number;
  pricePerQuintal: number;
  priceIsQualityAdjusted: boolean;
  priceDate: string;
  priceSource: MandiPriceRecord["source"];
  freshness: DataFreshness;
  expectedSaleValue: number;
  transportCost: number;
  commissionAmount: number;
  handlingAmount: number;
  cessAmount: number;
  totalMandiCharges: number;
  netEarnings: number;
  netEarningsPerQuintal: number;
}

export interface ComparisonResult {
  input: ComparisonInput;
  computedAt: string;
  ranked: MandiCalculationBreakdown[];
  bestMandiId: string | null;
  additionalEarningsVsNearest: number;
}

export interface FarmerFeedback {
  id: string;
  villageId: string;
  comparisonId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  message: string;
  createdAt: string;
}
