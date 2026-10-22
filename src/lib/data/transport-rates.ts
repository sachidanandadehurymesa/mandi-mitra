import type { TransportRateConfig } from "@/types/domain";

/**
 * DEMO DATA. Default transport rates per km by vehicle type. Farmers can
 * override the rate per km in the comparison form — these are starting
 * suggestions, not fixed tariffs. In production this maps to the
 * `transport_rates` table and can vary by region/season.
 */
export const DEMO_TRANSPORT_RATES: TransportRateConfig[] = [
  {
    type: "tractor",
    label: "Tractor + trolley",
    labelMr: "ट्रॅक्टर + ट्रॉली",
    defaultRatePerKm: 18,
    typicalCapacityQuintals: 25,
  },
  {
    type: "tempo",
    label: "Tempo",
    labelMr: "टेम्पो",
    defaultRatePerKm: 25,
    typicalCapacityQuintals: 40,
  },
  {
    type: "truck",
    label: "Truck",
    labelMr: "ट्रक",
    defaultRatePerKm: 35,
    typicalCapacityQuintals: 100,
  },
];

export function getTransportRateConfig(type: string): TransportRateConfig | undefined {
  return DEMO_TRANSPORT_RATES.find((t) => t.type === type);
}
