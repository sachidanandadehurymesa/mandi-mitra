import type { FarmerFeedback } from "@/types/domain";

/** DEMO DATA. In production this maps to the `farmer_feedback` table. */
export const DEMO_FEEDBACK: FarmerFeedback[] = [
  {
    id: "fb-1",
    villageId: "lasalgaon",
    rating: 5,
    message: "Niphad मंडीचा अंदाज बरोबर निघाला, वाहतूक खर्च पण जुळला.",
    createdAt: "2026-10-18T09:12:00.000Z",
  },
  {
    id: "fb-2",
    villageId: "vinchur",
    rating: 4,
    message: "Good estimate, but actual mandi price was slightly lower than shown.",
    createdAt: "2026-10-19T14:40:00.000Z",
  },
  {
    id: "fb-3",
    villageId: "yeola",
    rating: 3,
    message: "टेम्पो भाडे वेगळे होते, त्यामुळे नफा थोडा कमी झाला.",
    createdAt: "2026-10-20T07:05:00.000Z",
  },
];
