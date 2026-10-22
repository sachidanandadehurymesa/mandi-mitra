"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateDMY, formatINR } from "@/lib/utils";
import type { PriceHistoryPoint } from "@/lib/data/price-history";

export function PriceTrendChart({
  title,
  data,
}: {
  title: string;
  data: PriceHistoryPoint[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge variant="demo">DEMO</Badge>
      </CardHeader>
      <CardContent className="h-72 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#e3e8de" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDateDMY(v).slice(0, 6)}
              tick={{ fontSize: 12, fill: "#4b5a50" }}
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
            <Tooltip
              formatter={(value) => [formatINR(Number(value)), "Modal price"]}
              labelFormatter={(label) => formatDateDMY(String(label))}
              contentStyle={{ borderRadius: 12, borderColor: "#e3e8de" }}
            />
            <Line
              type="monotone"
              dataKey="pricePerQuintal"
              stroke="#14532d"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
