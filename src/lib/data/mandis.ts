import type { Mandi } from "@/types/domain";

/**
 * DEMO DATA. APMC mandis in and around the Nashik-Lasalgaon onion belt.
 * In production this would come from the `mandis` table (see supabase/migrations).
 */
export const DEMO_MANDIS: Mandi[] = [
  { id: "lasalgaon-apmc", name: "Lasalgaon APMC", nameMr: "लासलगाव एपीएमसी", taluka: "Niphad", district: "Nashik" },
  { id: "pimpalgaon-apmc", name: "Pimpalgaon Baswant APMC", nameMr: "पिंपळगाव बसवंत एपीएमसी", taluka: "Niphad", district: "Nashik" },
  { id: "niphad-apmc", name: "Niphad APMC", nameMr: "निफाड एपीएमसी", taluka: "Niphad", district: "Nashik" },
  { id: "yeola-apmc", name: "Yeola APMC", nameMr: "येवला एपीएमसी", taluka: "Yeola", district: "Nashik" },
  { id: "chandwad-apmc", name: "Chandwad APMC", nameMr: "चांदवड एपीएमसी", taluka: "Chandwad", district: "Nashik" },
  { id: "dindori-apmc", name: "Dindori APMC", nameMr: "दिंडोरी एपीएमसी", taluka: "Dindori", district: "Nashik" },
  { id: "manmad-apmc", name: "Manmad APMC", nameMr: "मनमाड एपीएमसी", taluka: "Nandgaon", district: "Nashik" },
  { id: "nashik-apmc", name: "Nashik (Main) APMC", nameMr: "नाशिक (मुख्य) एपीएमसी", taluka: "Nashik", district: "Nashik" },
];

export function getMandiById(id: string): Mandi | undefined {
  return DEMO_MANDIS.find((m) => m.id === id);
}
