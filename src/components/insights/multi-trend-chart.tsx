"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateDMY, formatINR } from "@/lib/utils";

const COLORS = ["#14532d", "#22c55e", "#facc15", "#0ea5e9", "#dc2626", "#7c3aed"];

export interface MultiSeriesPoint {
  date: string;
  [mandiName: string]: number | string;
}

export function MultiTrendChart({
  title,
  data,
  seriesNames,
}: {
  title: string;
  data: MultiSeriesPoint[];
  seriesNames: string[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge variant="demo">DEMO</Badge>
      </CardHeader>
      <CardContent className="h-96 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#e3e8de" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDateDMY(v).slice(0, 6)}
              tick={{ fontSize: 11, fill: "#4b5a50" }}
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
              formatter={(value) => formatINR(Number(value))}
              labelFormatter={(label) => formatDateDMY(String(label))}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {seriesNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
