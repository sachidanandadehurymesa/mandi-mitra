import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import * as React from "react";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-(--color-forest) text-white hover:bg-(--color-forest-dark)",
        secondary: "bg-white text-(--color-forest) border border-(--color-forest)/20 hover:bg-(--color-green-light)",
        accent: "bg-(--color-gold) text-(--color-forest-dark) hover:brightness-95",
        ghost: "bg-transparent text-(--color-text) hover:bg-black/5",
        danger: "bg-(--color-danger) text-white hover:brightness-95",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-14 px-7 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
