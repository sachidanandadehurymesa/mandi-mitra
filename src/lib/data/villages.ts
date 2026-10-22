import type { Village } from "@/types/domain";

/**
 * DEMO DATA. Villages in the Nashik-Lasalgaon onion belt, Maharashtra.
 * In production this would come from the `villages` table (see supabase/migrations).
 */
export const DEMO_VILLAGES: Village[] = [
  { id: "lasalgaon", name: "Lasalgaon", nameMr: "लासलगाव", taluka: "Niphad", district: "Nashik" },
  { id: "vinchur", name: "Vinchur", nameMr: "विंचूर", taluka: "Niphad", district: "Nashik" },
  { id: "pimpalgaon-b", name: "Pimpalgaon Baswant", nameMr: "पिंपळगाव बसवंत", taluka: "Niphad", district: "Nashik" },
  { id: "niphad", name: "Niphad", nameMr: "निफाड", taluka: "Niphad", district: "Nashik" },
  { id: "yeola", name: "Yeola", nameMr: "येवला", taluka: "Yeola", district: "Nashik" },
  { id: "chandwad", name: "Chandwad", nameMr: "चांदवड", taluka: "Chandwad", district: "Nashik" },
  { id: "dindori", name: "Dindori", nameMr: "दिंडोरी", taluka: "Dindori", district: "Nashik" },
  { id: "manmad", name: "Manmad", nameMr: "मनमाड", taluka: "Nandgaon", district: "Nashik" },
  { id: "satana", name: "Satana (Baglan)", nameMr: "सटाणा (बागलाण)", taluka: "Baglan", district: "Nashik" },
  { id: "sinnar", name: "Sinnar", nameMr: "सिन्नर", taluka: "Sinnar", district: "Nashik" },
];

export function getVillageById(id: string): Village | undefined {
  return DEMO_VILLAGES.find((v) => v.id === id);
}
