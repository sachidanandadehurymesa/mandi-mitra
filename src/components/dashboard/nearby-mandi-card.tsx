import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatDateDMY } from "@/lib/utils";
import type { DataFreshness } from "@/types/domain";

function freshnessVariant(freshness: DataFreshness): "live" | "demo" | "stale" | "neutral" {
  if (freshness === "live") return "live";
  if (freshness === "demo") return "demo";
  if (freshness === "stale") return "stale";
  return "neutral";
}

export function NearbyMandiCard({
  name,
  distanceKm,
  pricePerQuintal,
  priceDate,
  freshness,
}: {
  name: string;
  distanceKm: number;
  pricePerQuintal: number;
  priceDate: string;
  freshness: DataFreshness;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="font-semibold">{name}</p>
          <p className="flex items-center gap-1 text-xs text-(--color-text-muted)">
            <MapPin size={12} /> {distanceKm} km · {formatDateDMY(priceDate)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-(--color-forest)">{formatINR(pricePerQuintal)}</p>
          <Badge variant={freshnessVariant(freshness)} className="mt-1">
            {freshness.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
