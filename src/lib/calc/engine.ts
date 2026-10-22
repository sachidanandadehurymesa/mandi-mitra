/**
 * Deterministic calculation engine for Mandi Mitra.
 *
 * This module performs ALL financial math. No AI/LLM output is ever used
 * here — the AI assistant (see lib/ai/assistant.ts) only extracts structured
 * input and explains results in plain language; it never computes money.
 */
import type {
  ComparisonInput,
  ComparisonResult,
  Mandi,
  MandiCalculationBreakdown,
  MandiCharges,
  MandiDistance,
  MandiPriceRecord,
} from "@/types/domain";

export class CalculationValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid comparison input: ${issues.join("; ")}`);
    this.name = "CalculationValidationError";
  }
}

const KG_PER_QUINTAL = 100;

/** Converts a quantity (bags or quintals) into quintals. */
export function toQuintals(
  quantity: number,
  unit: ComparisonInput["unit"],
  avgWeightPerBagKg: number
): number {
  if (unit === "quintals") return quantity;
  return (quantity * avgWeightPerBagKg) / KG_PER_QUINTAL;
}

/** Validates raw comparison input. Returns a list of human-readable issues (empty = valid). */
export function validateComparisonInput(input: ComparisonInput): string[] {
  const issues: string[] = [];

  if (!input.villageId) issues.push("Village is required.");
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    issues.push("Quantity must be a positive number.");
  }
  if (input.unit === "bags") {
    if (!Number.isFinite(input.avgWeightPerBagKg) || input.avgWeightPerBagKg <= 0) {
      issues.push("Average weight per bag must be a positive number.");
    }
    if (input.avgWeightPerBagKg > 100) {
      issues.push("Average weight per bag looks too high (max 100 kg).");
    }
  }
  if (!["good", "medium", "low"].includes(input.quality)) {
    issues.push("Onion quality must be good, medium, or low.");
  }
  if (!["tractor", "tempo", "truck"].includes(input.transportType)) {
    issues.push("Transport type must be tractor, tempo, or truck.");
  }
  if (!Number.isFinite(input.transportRatePerKm) || input.transportRatePerKm < 0) {
    issues.push("Transport rate per km cannot be negative.");
  }

  return issues;
}

function validateMandiRecords(
  charges: MandiCharges,
  priceRecord: MandiPriceRecord,
  distanceKm: number
): string[] {
  const issues: string[] = [];
  if (distanceKm < 0) issues.push("Distance cannot be negative.");
  if (priceRecord.modalPricePerQuintal < 0) issues.push("Price cannot be negative.");
  if (charges.commissionRate < 0 || charges.commissionRate >= 1) {
    issues.push("Commission rate must be between 0 and 1 (exclusive of 1).");
  }
  if (charges.handlingChargePerQuintal < 0) issues.push("Handling charge cannot be negative.");
  if (charges.cessFlat < 0) issues.push("Cess cannot be negative.");
  return issues;
}

interface MandiInputBundle {
  mandi: Mandi;
  distance: MandiDistance;
  priceRecord: MandiPriceRecord;
  charges: MandiCharges;
}

/**
 * Computes the full cost/earnings breakdown for a single mandi.
 *
 * Net earnings = Expected sale value - Transport cost - Mandi charges.
 * Mandi charges = commission (% of sale value) + flat handling (per quintal) + flat cess.
 * These three are configured independently per mandi so none is double-counted.
 */
export function calculateMandiBreakdown(
  input: ComparisonInput,
  bundle: MandiInputBundle
): MandiCalculationBreakdown {
  const { mandi, distance, priceRecord, charges } = bundle;

  const recordIssues = validateMandiRecords(charges, priceRecord, distance.distanceKm);
  if (recordIssues.length > 0) {
    throw new CalculationValidationError(recordIssues);
  }

  const quantityQuintals = toQuintals(input.quantity, input.unit, input.avgWeightPerBagKg);
  const roundTripKm = distance.distanceKm * 2;

  const expectedSaleValue = quantityQuintals * priceRecord.modalPricePerQuintal;
  const transportCost = roundTripKm * input.transportRatePerKm;

  const commissionAmount = expectedSaleValue * charges.commissionRate;
  const handlingAmount = quantityQuintals * charges.handlingChargePerQuintal;
  const cessAmount = charges.cessFlat;
  const totalMandiCharges = commissionAmount + handlingAmount + cessAmount;

  const netEarnings = expectedSaleValue - transportCost - totalMandiCharges;
  const netEarningsPerQuintal = quantityQuintals > 0 ? netEarnings / quantityQuintals : 0;

  return {
    mandiId: mandi.id,
    mandiName: mandi.name,
    mandiNameMr: mandi.nameMr,
    distanceKm: distance.distanceKm,
    roundTripKm,
    quantityQuintals,
    pricePerQuintal: priceRecord.modalPricePerQuintal,
    priceIsQualityAdjusted: priceRecord.isQualityAdjusted,
    priceDate: priceRecord.priceDate,
    priceSource: priceRecord.source,
    freshness: priceRecord.freshness,
    expectedSaleValue,
    transportCost,
    commissionAmount,
    handlingAmount,
    cessAmount,
    totalMandiCharges,
    netEarnings,
    netEarningsPerQuintal,
  };
}

/**
 * Ranks every mandi the farmer could sell at by net earnings (not raw price)
 * and returns the top three plus the gain over the nearest/cheapest-looking option.
 */
export function rankMandis(
  input: ComparisonInput,
  bundles: MandiInputBundle[]
): ComparisonResult {
  const inputIssues = validateComparisonInput(input);
  if (inputIssues.length > 0) {
    throw new CalculationValidationError(inputIssues);
  }
  if (bundles.length === 0) {
    throw new CalculationValidationError([
      "No mandis with price and distance data are available for this village.",
    ]);
  }

  const breakdowns = bundles.map((bundle) => calculateMandiBreakdown(input, bundle));

  const ranked = [...breakdowns].sort((a, b) => b.netEarnings - a.netEarnings).slice(0, 3);

  const nearest = [...breakdowns].sort((a, b) => a.distanceKm - b.distanceKm)[0];
  const best = ranked[0] ?? null;
  const additionalEarningsVsNearest =
    best && nearest ? Math.max(0, best.netEarnings - nearest.netEarnings) : 0;

  return {
    input,
    computedAt: new Date().toISOString(),
    ranked,
    bestMandiId: best?.mandiId ?? null,
    additionalEarningsVsNearest,
  };
}
