"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useLanguage } from "@/components/providers/language-provider";
import { DEMO_VILLAGES } from "@/lib/data/villages";
import { DEMO_TRANSPORT_RATES } from "@/lib/data/transport-rates";
import { comparisonFormSchema, type ComparisonFormValues } from "@/lib/validation/schemas";
import type { ComparisonResult } from "@/types/domain";

const RESULT_STORAGE_KEY = "mandi-mitra-last-result";

const initialState: ComparisonFormValues = {
  crop: "onion",
  villageId: "",
  quantity: 20,
  unit: "bags",
  avgWeightPerBagKg: 50,
  quality: "good",
  transportType: "tempo",
  transportRatePerKm: 25,
  notes: "",
};

export function CompareForm() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [form, setForm] = useState<ComparisonFormValues>(initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ComparisonFormValues>(key: K, value: ComparisonFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const parsed = comparisonFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.issues ?? [data.error ?? "Something went wrong."]);
        setSubmitting(false);
        return;
      }
      const result: ComparisonResult = data.result;
      try {
        window.sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
      } catch {
        // sessionStorage unavailable — results page will show the empty state.
      }
      router.push("/compare/results");
    } catch {
      setErrors(["Could not reach the server. Please check your connection and try again."]);
      setSubmitting(false);
    }
  }

  const selectedTransport = DEMO_TRANSPORT_RATES.find((tr) => tr.type === form.transportType);

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {errors.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-(--color-danger)/30 bg-(--color-danger-bg) p-4 text-(--color-danger)">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{t.compare.validationTitle}</p>
                <ul className="mt-1 list-inside list-disc text-sm">
                  {errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div>
            <Label>{t.compare.cropLabel}</Label>
            <Input value="Onion / कांदा" disabled />
          </div>

          <div>
            <Label htmlFor="village">{t.compare.villageLabel}</Label>
            <Select
              id="village"
              value={form.villageId}
              onChange={(e) => update("villageId", e.target.value)}
              required
            >
              <option value="">{t.compare.villagePlaceholder}</option>
              {DEMO_VILLAGES.map((v) => (
                <option key={v.id} value={v.id}>
                  {locale === "mr" ? v.nameMr : v.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">{t.compare.quantityLabel}</Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                step="0.1"
                value={form.quantity}
                onChange={(e) => update("quantity", Number(e.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">{t.compare.unitLabel}</Label>
              <Select
                id="unit"
                value={form.unit}
                onChange={(e) => update("unit", e.target.value as ComparisonFormValues["unit"])}
              >
                <option value="bags">{t.compare.unitBags}</option>
                <option value="quintals">{t.compare.unitQuintals}</option>
              </Select>
            </div>
          </div>

          {form.unit === "bags" && (
            <div>
              <Label htmlFor="avgWeight">{t.compare.avgWeightLabel}</Label>
              <Input
                id="avgWeight"
                type="number"
                min={0}
                max={100}
                value={form.avgWeightPerBagKg}
                onChange={(e) => update("avgWeightPerBagKg", Number(e.target.value))}
              />
            </div>
          )}

          <div>
            <Label htmlFor="quality">{t.compare.qualityLabel}</Label>
            <Select
              id="quality"
              value={form.quality}
              onChange={(e) => update("quality", e.target.value as ComparisonFormValues["quality"])}
            >
              <option value="good">{t.compare.qualityGood}</option>
              <option value="medium">{t.compare.qualityMedium}</option>
              <option value="low">{t.compare.qualityLow}</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transportType">{t.compare.transportTypeLabel}</Label>
              <Select
                id="transportType"
                value={form.transportType}
                onChange={(e) => {
                  const type = e.target.value as ComparisonFormValues["transportType"];
                  update("transportType", type);
                  const rate = DEMO_TRANSPORT_RATES.find((tr) => tr.type === type);
                  if (rate) update("transportRatePerKm", rate.defaultRatePerKm);
                }}
              >
                <option value="tractor">{t.compare.transportTractor}</option>
                <option value="tempo">{t.compare.transportTempo}</option>
                <option value="truck">{t.compare.transportTruck}</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="transportRate">{t.compare.transportRateLabel}</Label>
              <Input
                id="transportRate"
                type="number"
                min={0}
                value={form.transportRatePerKm}
                onChange={(e) => update("transportRatePerKm", Number(e.target.value))}
              />
            </div>
          </div>
          {selectedTransport && (
            <p className="-mt-3 text-xs text-(--color-text-muted)">
              Typical capacity: ~{selectedTransport.typicalCapacityQuintals} quintals. Suggested
              rate shown — edit if your local rate is different.
            </p>
          )}

          <div>
            <Label htmlFor="notes">{t.compare.notesLabel}</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" /> {t.compare.submitting}
              </>
            ) : (
              t.compare.submitButton
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export { RESULT_STORAGE_KEY };
