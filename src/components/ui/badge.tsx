import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        neutral: "bg-black/5 text-(--color-text-muted)",
        demo: "bg-(--color-gold)/20 text-(--color-forest-dark) border border-(--color-gold)/40",
        live: "bg-(--color-green-light) text-(--color-forest)",
        stale: "bg-(--color-danger-bg) text-(--color-danger)",
        best: "bg-(--color-gold) text-(--color-forest-dark)",
        forest: "bg-(--color-forest) text-white",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
