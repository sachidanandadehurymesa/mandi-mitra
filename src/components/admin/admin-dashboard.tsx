"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, LogOut, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  adminChargesSchema,
  adminDistanceSchema,
  adminPriceSchema,
} from "@/lib/validation/schemas";
import type {
  FarmerFeedback,
  Mandi,
  MandiCharges,
  MandiDistance,
  MandiPriceRecord,
  TransportRateConfig,
  Village,
} from "@/types/domain";

type TabKey = "mandis" | "distances" | "prices" | "charges" | "transport" | "feedback";

interface AdminDashboardProps {
  mandis: Mandi[];
  villages: Village[];
  distances: MandiDistance[];
  prices: MandiPriceRecord[];
  charges: MandiCharges[];
  transportRates: TransportRateConfig[];
  feedback: FarmerFeedback[];
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "mandis", label: "Mandis" },
  { key: "distances", label: "Distances" },
  { key: "prices", label: "Prices" },
  { key: "charges", label: "Charges" },
  { key: "transport", label: "Transport rates" },
  { key: "feedback", label: "Feedback" },
];

export function AdminDashboard(props: AdminDashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("mandis");
  const [savedTab, setSavedTab] = useState<TabKey | null>(null);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  function markSaved(key: TabKey) {
    setSavedTab(key);
    setTimeout(() => setSavedTab((cur) => (cur === key ? null : cur)), 2500);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-(--color-forest-dark)">Admin Dashboard</h1>
        <Button variant="secondary" onClick={handleLogout}>
          <LogOut size={16} /> Sign out
        </Button>
      </div>

      <div className="rounded-xl border border-(--color-gold)/40 bg-(--color-gold)/10 p-4 text-sm text-(--color-forest-dark)">
        Demo mode: changes here update this browser session only and are not persisted. Connect
        Supabase to persist changes across reloads and devices.
      </div>

      <div className="flex flex-wrap gap-2 border-b border-(--color-border) pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "focus-ring rounded-lg px-3 py-2 text-sm font-semibold",
              tab === t.key
                ? "bg-(--color-forest) text-white"
                : "text-(--color-text-muted) hover:bg-black/5"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "mandis" && <MandisTab mandis={props.mandis} onSave={() => markSaved("mandis")} />}
      {tab === "distances" && (
        <DistancesTab
          distances={props.distances}
          mandis={props.mandis}
          villages={props.villages}
          onSave={() => markSaved("distances")}
        />
      )}
      {tab === "prices" && (
        <PricesTab prices={props.prices} mandis={props.mandis} onSave={() => markSaved("prices")} />
      )}
      {tab === "charges" && (
        <ChargesTab charges={props.charges} mandis={props.mandis} onSave={() => markSaved("charges")} />
      )}
      {tab === "transport" && (
        <TransportTab rates={props.transportRates} onSave={() => markSaved("transport")} />
      )}
      {tab === "feedback" && <FeedbackTab feedback={props.feedback} />}

      {savedTab === tab && (
        <div className="flex items-center gap-2 rounded-lg bg-(--color-green-light) p-3 text-sm text-(--color-forest-dark)">
          <CheckCircle2 size={16} /> Saved (demo mode — not persisted)
        </div>
      )}
    </div>
  );
}

function ValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg bg-(--color-danger-bg) p-3 text-sm text-(--color-danger)">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <ul className="list-inside list-disc">
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

function MandisTab({ mandis, onSave }: { mandis: Mandi[]; onSave: () => void }) {
  const [rows, setRows] = useState(mandis);

  return (
    <Card>
      <CardContent className="overflow-x-auto p-5">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-(--color-text-muted)">
              <th className="pb-2">Name</th>
              <th className="pb-2">Marathi name</th>
              <th className="pb-2">Taluka</th>
              <th className="pb-2">District</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m, i) => (
              <tr key={m.id} className="border-t border-(--color-border)">
                <td className="py-2 pr-2">
                  <Input
                    value={m.name}
                    onChange={(e) =>
                      setRows((r) => r.map((row, idx) => (idx === i ? { ...row, name: e.target.value } : row)))
                    }
                  />
                </td>
                <td className="py-2 pr-2">
                  <Input
                    value={m.nameMr}
                    onChange={(e) =>
                      setRows((r) => r.map((row, idx) => (idx === i ? { ...row, nameMr: e.target.value } : row)))
                    }
                  />
                </td>
                <td className="py-2 pr-2">{m.taluka}</td>
                <td className="py-2">{m.district}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button className="mt-4" onClick={onSave}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
}

function DistancesTab({
  distances,
  mandis,
  villages,
  onSave,
}: {
  distances: MandiDistance[];
  mandis: Mandi[];
  villages: Village[];
  onSave: () => void;
}) {
  const [rows, setRows] = useState(distances);
  const [villageFilter, setVillageFilter] = useState<string>("all");
  const [errors, setErrors] = useState<string[]>([]);

  const filtered = useMemo(
    () => (villageFilter === "all" ? rows : rows.filter((r) => r.villageId === villageFilter)),
    [rows, villageFilter]
  );

  function handleSave() {
    const allErrors: string[] = [];
    for (const r of rows) {
      const parsed = adminDistanceSchema.safeParse(r);
      if (!parsed.success) allErrors.push(...parsed.error.issues.map((i) => i.message));
    }
    setErrors(allErrors);
    if (allErrors.length === 0) onSave();
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="max-w-xs">
          <Label>Filter by village</Label>
          <Select value={villageFilter} onChange={(e) => setVillageFilter(e.target.value)}>
            <option value="all">All villages</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
        <ValidationErrors errors={errors} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-(--color-text-muted)">
                <th className="pb-2">Village</th>
                <th className="pb-2">Mandi</th>
                <th className="pb-2">Distance (km)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const villageName = villages.find((v) => v.id === d.villageId)?.name ?? d.villageId;
                const mandiName = mandis.find((m) => m.id === d.mandiId)?.name ?? d.mandiId;
                return (
                  <tr key={`${d.villageId}-${d.mandiId}`} className="border-t border-(--color-border)">
                    <td className="py-2 pr-2">{villageName}</td>
                    <td className="py-2 pr-2">{mandiName}</td>
                    <td className="py-2">
                      <Input
                        type="number"
                        min={0}
                        value={d.distanceKm}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setRows((r) =>
                            r.map((row) =>
                              row.villageId === d.villageId && row.mandiId === d.mandiId
                                ? { ...row, distanceKm: value }
                                : row
                            )
                          );
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Button onClick={handleSave}>Save</Button>
      </CardContent>
    </Card>
  );
}

function PricesTab({
  prices,
  mandis,
  onSave,
}: {
  prices: MandiPriceRecord[];
  mandis: Mandi[];
  onSave: () => void;
}) {
  const [rows, setRows] = useState(prices);
  const [errors, setErrors] = useState<string[]>([]);

  function handleSave() {
    const allErrors: string[] = [];
    for (const r of rows) {
      const parsed = adminPriceSchema.safeParse({
        mandiId: r.mandiId,
        modalPricePerQuintal: r.modalPricePerQuintal,
        priceDate: r.priceDate,
      });
      if (!parsed.success) allErrors.push(...parsed.error.issues.map((i) => i.message));
    }
    setErrors(allErrors);
    if (allErrors.length === 0) onSave();
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <ValidationErrors errors={errors} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-(--color-text-muted)">
                <th className="pb-2">Mandi</th>
                <th className="pb-2">Modal price (₹/quintal)</th>
                <th className="pb-2">Price date</th>
                <th className="pb-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={p.mandiId} className="border-t border-(--color-border)">
                  <td className="py-2 pr-2">{mandis.find((m) => m.id === p.mandiId)?.name ?? p.mandiId}</td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      min={0}
                      value={p.modalPricePerQuintal}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setRows((r) =>
                          r.map((row, idx) =>
                            idx === i
                              ? { ...row, modalPricePerQuintal: value, source: "manual-admin", freshness: "cached" }
                              : row
                          )
                        );
                      }}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="date"
                      value={p.priceDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRows((r) => r.map((row, idx) => (idx === i ? { ...row, priceDate: value } : row)));
                      }}
                    />
                  </td>
                  <td className="py-2">
                    <Badge variant={p.source === "demo-dataset" ? "demo" : "live"}>{p.source}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button onClick={handleSave}>Save</Button>
      </CardContent>
    </Card>
  );
}

function ChargesTab({
  charges,
  mandis,
  onSave,
}: {
  charges: MandiCharges[];
  mandis: Mandi[];
  onSave: () => void;
}) {
  const [rows, setRows] = useState(charges);
  const [errors, setErrors] = useState<string[]>([]);

  function handleSave() {
    const allErrors: string[] = [];
    for (const r of rows) {
      const parsed = adminChargesSchema.safeParse(r);
      if (!parsed.success) allErrors.push(...parsed.error.issues.map((i) => i.message));
    }
    setErrors(allErrors);
    if (allErrors.length === 0) onSave();
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <ValidationErrors errors={errors} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-(--color-text-muted)">
                <th className="pb-2">Mandi</th>
                <th className="pb-2">Commission rate</th>
                <th className="pb-2">Handling (₹/quintal)</th>
                <th className="pb-2">Cess (flat ₹)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.mandiId} className="border-t border-(--color-border)">
                  <td className="py-2 pr-2">{mandis.find((m) => m.id === c.mandiId)?.name ?? c.mandiId}</td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={0.99}
                      value={c.commissionRate}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setRows((r) => r.map((row, idx) => (idx === i ? { ...row, commissionRate: value } : row)));
                      }}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      min={0}
                      value={c.handlingChargePerQuintal}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setRows((r) =>
                          r.map((row, idx) => (idx === i ? { ...row, handlingChargePerQuintal: value } : row))
                        );
                      }}
                    />
                  </td>
                  <td className="py-2">
                    <Input
                      type="number"
                      min={0}
                      value={c.cessFlat}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setRows((r) => r.map((row, idx) => (idx === i ? { ...row, cessFlat: value } : row)));
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button onClick={handleSave}>Save</Button>
      </CardContent>
    </Card>
  );
}

function TransportTab({ rates, onSave }: { rates: TransportRateConfig[]; onSave: () => void }) {
  const [rows, setRows] = useState(rates);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="text-left text-(--color-text-muted)">
                <th className="pb-2">Vehicle</th>
                <th className="pb-2">Default rate (₹/km)</th>
                <th className="pb-2">Typical capacity (quintals)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.type} className="border-t border-(--color-border)">
                  <td className="py-2 pr-2">{r.label}</td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      min={0}
                      value={r.defaultRatePerKm}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setRows((rr) =>
                          rr.map((row, idx) => (idx === i ? { ...row, defaultRatePerKm: value } : row))
                        );
                      }}
                    />
                  </td>
                  <td className="py-2">{r.typicalCapacityQuintals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button onClick={onSave}>Save</Button>
      </CardContent>
    </Card>
  );
}

function FeedbackTab({ feedback }: { feedback: FarmerFeedback[] }) {
  const [rows, setRows] = useState(feedback);

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        {rows.length === 0 && <p className="text-sm text-(--color-text-muted)">No feedback yet.</p>}
        {rows.map((f) => (
          <div key={f.id} className="flex items-start justify-between gap-3 rounded-xl border border-(--color-border) p-4">
            <div>
              <p className="text-sm font-semibold">
                {"★".repeat(f.rating)}
                {"☆".repeat(5 - f.rating)}{" "}
                <span className="font-normal text-(--color-text-muted)">
                  · {new Date(f.createdAt).toLocaleDateString("en-IN")}
                </span>
              </p>
              <p className="mt-1 text-sm">{f.message}</p>
            </div>
            <button
              onClick={() => setRows((r) => r.filter((row) => row.id !== f.id))}
              className="focus-ring rounded-lg p-2 text-(--color-text-muted) hover:bg-black/5 hover:text-(--color-danger)"
              aria-label="Remove"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
