import type { MandiDistance } from "@/types/domain";

/**
 * DEMO DATA. Approximate one-way road distances (km) between each village and
 * each mandi. These are illustrative, not surveyed GPS distances — in
 * production this would come from the `mandi_distances` table, ideally
 * populated from a mapping/routing API.
 */
// villageId -> mandiId -> km
const DISTANCE_KM: Record<string, Record<string, number>> = {
  lasalgaon: {
    "lasalgaon-apmc": 2,
    "pimpalgaon-apmc": 18,
    "niphad-apmc": 10,
    "yeola-apmc": 35,
    "chandwad-apmc": 28,
    "dindori-apmc": 32,
    "manmad-apmc": 45,
    "nashik-apmc": 38,
  },
  vinchur: {
    "lasalgaon-apmc": 8,
    "pimpalgaon-apmc": 22,
    "niphad-apmc": 6,
    "yeola-apmc": 28,
    "chandwad-apmc": 32,
    "dindori-apmc": 36,
    "manmad-apmc": 38,
    "nashik-apmc": 34,
  },
  "pimpalgaon-b": {
    "lasalgaon-apmc": 18,
    "pimpalgaon-apmc": 2,
    "niphad-apmc": 14,
    "yeola-apmc": 48,
    "chandwad-apmc": 14,
    "dindori-apmc": 16,
    "manmad-apmc": 58,
    "nashik-apmc": 22,
  },
  niphad: {
    "lasalgaon-apmc": 10,
    "pimpalgaon-apmc": 14,
    "niphad-apmc": 2,
    "yeola-apmc": 32,
    "chandwad-apmc": 24,
    "dindori-apmc": 24,
    "manmad-apmc": 42,
    "nashik-apmc": 28,
  },
  yeola: {
    "lasalgaon-apmc": 35,
    "pimpalgaon-apmc": 48,
    "niphad-apmc": 32,
    "yeola-apmc": 2,
    "chandwad-apmc": 52,
    "dindori-apmc": 58,
    "manmad-apmc": 22,
    "nashik-apmc": 58,
  },
  chandwad: {
    "lasalgaon-apmc": 28,
    "pimpalgaon-apmc": 14,
    "niphad-apmc": 24,
    "yeola-apmc": 52,
    "chandwad-apmc": 2,
    "dindori-apmc": 28,
    "manmad-apmc": 48,
    "nashik-apmc": 38,
  },
  dindori: {
    "lasalgaon-apmc": 32,
    "pimpalgaon-apmc": 16,
    "niphad-apmc": 24,
    "yeola-apmc": 58,
    "chandwad-apmc": 28,
    "dindori-apmc": 2,
    "manmad-apmc": 64,
    "nashik-apmc": 28,
  },
  manmad: {
    "lasalgaon-apmc": 45,
    "pimpalgaon-apmc": 58,
    "niphad-apmc": 42,
    "yeola-apmc": 22,
    "chandwad-apmc": 48,
    "dindori-apmc": 64,
    "manmad-apmc": 2,
    "nashik-apmc": 68,
  },
  satana: {
    "lasalgaon-apmc": 52,
    "pimpalgaon-apmc": 44,
    "niphad-apmc": 48,
    "yeola-apmc": 78,
    "chandwad-apmc": 38,
    "dindori-apmc": 48,
    "manmad-apmc": 82,
    "nashik-apmc": 66,
  },
  sinnar: {
    "lasalgaon-apmc": 42,
    "pimpalgaon-apmc": 48,
    "niphad-apmc": 36,
    "yeola-apmc": 38,
    "chandwad-apmc": 58,
    "dindori-apmc": 52,
    "manmad-apmc": 48,
    "nashik-apmc": 32,
  },
};

export function getDemoDistances(): MandiDistance[] {
  const out: MandiDistance[] = [];
  for (const villageId of Object.keys(DISTANCE_KM)) {
    for (const mandiId of Object.keys(DISTANCE_KM[villageId])) {
      out.push({ villageId, mandiId, distanceKm: DISTANCE_KM[villageId][mandiId] });
    }
  }
  return out;
}

export function getDistance(villageId: string, mandiId: string): number | undefined {
  return DISTANCE_KM[villageId]?.[mandiId];
}
