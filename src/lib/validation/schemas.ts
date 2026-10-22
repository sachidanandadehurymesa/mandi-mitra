import { z } from "zod";

export const comparisonFormSchema = z.object({
  crop: z.literal("onion"),
  villageId: z.string().min(1, "Please select your village."),
  quantity: z.coerce.number().positive("Quantity must be greater than zero."),
  unit: z.enum(["bags", "quintals"]),
  avgWeightPerBagKg: z.coerce
    .number()
    .positive("Average bag weight must be greater than zero.")
    .max(100, "Average bag weight looks too high (max 100 kg)."),
  quality: z.enum(["good", "medium", "low"]),
  transportType: z.enum(["tractor", "tempo", "truck"]),
  transportRatePerKm: z.coerce.number().nonnegative("Transport rate cannot be negative."),
  notes: z.string().max(500).optional(),
});

export type ComparisonFormValues = z.infer<typeof comparisonFormSchema>;

export const feedbackSchema = z.object({
  villageId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  message: z.string().min(1, "Please write a short message.").max(1000),
});

export const adminPriceSchema = z.object({
  mandiId: z.string().min(1),
  modalPricePerQuintal: z.coerce.number().positive(),
  minPricePerQuintal: z.coerce.number().positive().optional(),
  maxPricePerQuintal: z.coerce.number().positive().optional(),
  priceDate: z.string().min(1),
});

export const adminChargesSchema = z.object({
  mandiId: z.string().min(1),
  commissionRate: z.coerce.number().min(0).max(0.99),
  handlingChargePerQuintal: z.coerce.number().min(0),
  cessFlat: z.coerce.number().min(0),
});

export const adminDistanceSchema = z.object({
  villageId: z.string().min(1),
  mandiId: z.string().min(1),
  distanceKm: z.coerce.number().min(0),
});
