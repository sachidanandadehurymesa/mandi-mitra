import type { MandiCharges } from "@/types/domain";
import { DEMO_MANDIS } from "./mandis";

/**
 * DEMO DATA. Mandi-side charges, configurable per mandi so they are never
 * double-counted: commission is a % of sale value, handling is a flat
 * per-quintal fee, cess is a flat per-transaction fee.
 * In production this maps to the `mandi_charges` table.
 */
const CHARGES_BY_MANDI: Record<string, Omit<MandiCharges, "mandiId">> = {
  "lasalgaon-apmc": { commissionRate: 0.06, handlingChargePerQuintal: 8, cessFlat: 40, notes: "Standard APMC commission + hamali" },
  "pimpalgaon-apmc": { commissionRate: 0.06, handlingChargePerQuintal: 10, cessFlat: 45 },
  "niphad-apmc": { commissionRate: 0.05, handlingChargePerQuintal: 8, cessFlat: 35 },
  "yeola-apmc": { commissionRate: 0.06, handlingChargePerQuintal: 7, cessFlat: 30 },
  "chandwad-apmc": { commissionRate: 0.055, handlingChargePerQuintal: 9, cessFlat: 35 },
  "dindori-apmc": { commissionRate: 0.06, handlingChargePerQuintal: 8, cessFlat: 40 },
  "manmad-apmc": { commissionRate: 0.05, handlingChargePerQuintal: 6, cessFlat: 25 },
  "nashik-apmc": { commissionRate: 0.065, handlingChargePerQuintal: 12, cessFlat: 60, notes: "Higher-volume main market, higher handling fee" },
};

export function getDemoCharges(): MandiCharges[] {
  return DEMO_MANDIS.map((mandi) => ({
    mandiId: mandi.id,
    ...(CHARGES_BY_MANDI[mandi.id] ?? { commissionRate: 0.06, handlingChargePerQuintal: 8, cessFlat: 40 }),
  }));
}

export function getDemoChargesForMandi(mandiId: string): MandiCharges | undefined {
  return getDemoCharges().find((c) => c.mandiId === mandiId);
}
