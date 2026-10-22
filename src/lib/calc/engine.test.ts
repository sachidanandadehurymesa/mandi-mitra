import { describe, expect, it } from "vitest";
import {
  CalculationValidationError,
  calculateMandiBreakdown,
  rankMandis,
  toQuintals,
  validateComparisonInput,
} from "./engine";
import type {
  ComparisonInput,
  Mandi,
  MandiCharges,
  MandiDistance,
  MandiPriceRecord,
} from "@/types/domain";

const baseInput: ComparisonInput = {
  crop: "onion",
  villageId: "lasalgaon",
  quantity: 20,
  unit: "bags",
  avgWeightPerBagKg: 50,
  quality: "good",
  transportType: "tempo",
  transportRatePerKm: 25,
};

function mandiBundle(overrides: {
  mandiId?: string;
  distanceKm?: number;
  price?: number;
  commissionRate?: number;
  handling?: number;
  cess?: number;
}) {
  const mandiId = overrides.mandiId ?? "lasalgaon-mandi";
  const mandi: Mandi = {
    id: mandiId,
    name: "Lasalgaon APMC",
    nameMr: "लासलगाव एपीएमसी",
    taluka: "Niphad",
    district: "Nashik",
  };
  const distance: MandiDistance = {
    villageId: "lasalgaon",
    mandiId,
    distanceKm: overrides.distanceKm ?? 10,
  };
  const priceRecord: MandiPriceRecord = {
    mandiId,
    crop: "onion",
    quality: "reference",
    modalPricePerQuintal: overrides.price ?? 1800,
    priceDate: "2026-10-20",
    fetchedAt: "2026-10-20T06:00:00.000Z",
    source: "demo-dataset",
    freshness: "demo",
    isQualityAdjusted: false,
  };
  const charges: MandiCharges = {
    mandiId,
    commissionRate: overrides.commissionRate ?? 0.06,
    handlingChargePerQuintal: overrides.handling ?? 10,
    cessFlat: overrides.cess ?? 50,
  };
  return { mandi, distance, priceRecord, charges };
}

describe("toQuintals", () => {
  it("converts bags to quintals using average bag weight", () => {
    expect(toQuintals(20, "bags", 50)).toBeCloseTo(10);
  });

  it("passes quintals through unchanged", () => {
    expect(toQuintals(12.5, "quintals", 50)).toBe(12.5);
  });
});

describe("validateComparisonInput", () => {
  it("accepts a well-formed input", () => {
    expect(validateComparisonInput(baseInput)).toEqual([]);
  });

  it("rejects zero or negative quantity", () => {
    const issues = validateComparisonInput({ ...baseInput, quantity: 0 });
    expect(issues.length).toBeGreaterThan(0);
  });

  it("rejects negative transport rate", () => {
    const issues = validateComparisonInput({ ...baseInput, transportRatePerKm: -5 });
    expect(issues).toContain("Transport rate per km cannot be negative.");
  });

  it("rejects missing village", () => {
    const issues = validateComparisonInput({ ...baseInput, villageId: "" });
    expect(issues).toContain("Village is required.");
  });

  it("rejects an unrealistic bag weight", () => {
    const issues = validateComparisonInput({ ...baseInput, avgWeightPerBagKg: 500 });
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe("calculateMandiBreakdown", () => {
  it("computes expected sale value, transport cost, charges and net earnings", () => {
    const bundle = mandiBundle({ distanceKm: 10, price: 1800, commissionRate: 0.06, handling: 10, cess: 50 });
    const breakdown = calculateMandiBreakdown(baseInput, bundle);

    // 20 bags * 50kg = 1000kg = 10 quintals
    expect(breakdown.quantityQuintals).toBeCloseTo(10);
    // Sale value = 10 * 1800 = 18000
    expect(breakdown.expectedSaleValue).toBeCloseTo(18000);
    // Round trip = 20km * 25/km = 500
    expect(breakdown.transportCost).toBeCloseTo(500);
    // Commission = 18000 * 0.06 = 1080, handling = 10*10=100, cess=50 => total 1230
    expect(breakdown.totalMandiCharges).toBeCloseTo(1230);
    // Net = 18000 - 500 - 1230 = 16270
    expect(breakdown.netEarnings).toBeCloseTo(16270);
    expect(breakdown.netEarningsPerQuintal).toBeCloseTo(1627);
  });

  it("never double counts mandi charges across commission, handling, and cess", () => {
    const bundle = mandiBundle({ commissionRate: 0.05, handling: 0, cess: 0 });
    const breakdown = calculateMandiBreakdown(baseInput, bundle);
    expect(breakdown.totalMandiCharges).toBeCloseTo(breakdown.commissionAmount);
  });

  it("throws on negative distance", () => {
    const bundle = mandiBundle({ distanceKm: -1 });
    expect(() => calculateMandiBreakdown(baseInput, bundle)).toThrow(CalculationValidationError);
  });

  it("throws on invalid commission rate", () => {
    const bundle = mandiBundle({ commissionRate: 1.5 });
    expect(() => calculateMandiBreakdown(baseInput, bundle)).toThrow(CalculationValidationError);
  });
});

describe("rankMandis", () => {
  it("ranks mandis by net earnings, not raw price", () => {
    // Mandi A has a higher price but is far away with high charges.
    const far = mandiBundle({ mandiId: "far-high-price", distanceKm: 120, price: 2000, commissionRate: 0.08, handling: 20, cess: 100 });
    // Mandi B has a lower price but is close with low charges.
    const near = mandiBundle({ mandiId: "near-lower-price", distanceKm: 5, price: 1750, commissionRate: 0.04, handling: 5, cess: 20 });

    const result = rankMandis(baseInput, [far, near]);

    expect(result.ranked[0].mandiId).toBe("near-lower-price");
    expect(result.bestMandiId).toBe("near-lower-price");
  });

  it("returns at most three ranked mandis", () => {
    const bundles = ["m1", "m2", "m3", "m4", "m5"].map((id, i) =>
      mandiBundle({ mandiId: id, distanceKm: 10 + i, price: 1800 - i * 10 })
    );
    const result = rankMandis(baseInput, bundles);
    expect(result.ranked.length).toBe(3);
  });

  it("computes non-negative additional earnings versus the nearest mandi", () => {
    const far = mandiBundle({ mandiId: "far", distanceKm: 100, price: 2200 });
    const near = mandiBundle({ mandiId: "near", distanceKm: 5, price: 1700 });
    const result = rankMandis(baseInput, [far, near]);
    expect(result.additionalEarningsVsNearest).toBeGreaterThanOrEqual(0);
  });

  it("throws a validation error with no mandi data", () => {
    expect(() => rankMandis(baseInput, [])).toThrow(CalculationValidationError);
  });

  it("throws a validation error for invalid top-level input", () => {
    const bundle = mandiBundle({});
    expect(() => rankMandis({ ...baseInput, quantity: -5 }, [bundle])).toThrow(
      CalculationValidationError
    );
  });
});
