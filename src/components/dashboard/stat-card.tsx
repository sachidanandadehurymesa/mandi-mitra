import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  demo = true,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
  demo?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-green-light) text-(--color-forest)">
            <Icon size={20} />
          </div>
          {demo && <Badge variant="demo">DEMO</Badge>}
        </div>
        <p className="mt-4 text-sm text-(--color-text-muted)">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-(--color-text)">{value}</p>
        {sublabel && <p className="mt-1 text-xs text-(--color-text-muted)">{sublabel}</p>}
      </CardContent>
    </Card>
  );
}
