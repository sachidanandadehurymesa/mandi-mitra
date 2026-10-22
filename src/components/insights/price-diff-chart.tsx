"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import type { MandiPricePoint } from "./modal-price-bar-chart";

export function PriceDiffChart({ title, data }: { title: string; data: MandiPricePoint[] }) {
  const lowest = Math.min(...data.map((d) => d.pricePerQuintal));
  const withDiff = data
    .map((d) => ({ ...d, diff: d.pricePerQuintal - lowest }))
    .sort((a, b) => b.diff - a.diff);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge variant="demo">DEMO</Badge>
      </CardHeader>
      <CardContent className="h-80 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={withDiff} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid stroke="#e3e8de" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#4b5a50" }}
              axisLine={{ stroke: "#e3e8de" }}
              tickLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <YAxis
              type="category"
              dataKey="mandiName"
              tick={{ fontSize: 12, fill: "#4b5a50" }}
              width={140}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(value) => [formatINR(Number(value)), "Above lowest mandi"]} />
            <Bar dataKey="diff" radius={[0, 6, 6, 0]}>
              {withDiff.map((entry) => (
                <Cell key={entry.mandiId} fill={entry.diff === 0 ? "#e3e8de" : "#22c55e"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
