"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";

export interface MandiPricePoint {
  mandiId: string;
  mandiName: string;
  pricePerQuintal: number;
}

const COLORS = ["#14532d", "#22c55e", "#4ade80", "#86efac", "#166534", "#15803d", "#16a34a", "#065f46"];

export function ModalPriceBarChart({ title, data }: { title: string; data: MandiPricePoint[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge variant="demo">DEMO</Badge>
      </CardHeader>
      <CardContent className="h-80 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
            <CartesianGrid stroke="#e3e8de" vertical={false} />
            <XAxis
              dataKey="mandiName"
              tick={{ fontSize: 11, fill: "#4b5a50" }}
              angle={-30}
              textAnchor="end"
              interval={0}
              axisLine={{ stroke: "#e3e8de" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#4b5a50" }}
              axisLine={false}
              tickLine={false}
              width={60}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip formatter={(value) => [formatINR(Number(value)), "Modal price"]} />
            <Bar dataKey="pricePerQuintal" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={entry.mandiId} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
