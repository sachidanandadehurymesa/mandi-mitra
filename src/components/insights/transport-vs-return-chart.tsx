"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";

export interface TransportReturnPoint {
  mandiId: string;
  mandiName: string;
  transportCost: number;
  netEarnings: number;
}

export function TransportVsReturnChart({
  title,
  data,
}: {
  title: string;
  data: TransportReturnPoint[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge variant="demo">DEMO</Badge>
      </CardHeader>
      <CardContent className="h-80 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid stroke="#e3e8de" />
            <XAxis
              type="number"
              dataKey="transportCost"
              name="Transport cost"
              tick={{ fontSize: 12, fill: "#4b5a50" }}
              tickFormatter={(v) => `₹${v}`}
              axisLine={{ stroke: "#e3e8de" }}
              tickLine={false}
              label={{ value: "Transport cost (₹)", position: "insideBottom", offset: -5, fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="netEarnings"
              name="Net earnings"
              tick={{ fontSize: 12, fill: "#4b5a50" }}
              tickFormatter={(v) => `₹${v}`}
              axisLine={false}
              tickLine={false}
              width={70}
              label={{ value: "Net earnings (₹)", angle: -90, position: "insideLeft", fontSize: 12 }}
            />
            <ZAxis range={[120, 120]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value, name) => [formatINR(Number(value)), String(name)]}
              labelFormatter={() => ""}
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const p = payload[0].payload as TransportReturnPoint;
                return (
                  <div className="rounded-lg border border-(--color-border) bg-white p-2 text-xs shadow">
                    <p className="font-semibold">{p.mandiName}</p>
                    <p>Transport: {formatINR(p.transportCost)}</p>
                    <p>Net earnings: {formatINR(p.netEarnings)}</p>
                  </div>
                );
              }}
            />
            <Scatter data={data} fill="#14532d" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
