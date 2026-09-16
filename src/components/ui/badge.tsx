import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
  {
    variants: {
      variant: {
        champagne: "bg-champagne/15 text-champagne border border-champagne/30",
        obsidian: "bg-obsidian text-ivory",
        ivory: "bg-ivory text-obsidian border border-soft-gray",
        sale: "bg-obsidian text-ivory",
        success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        warning: "bg-amber-100 text-amber-700 border border-amber-200",
        danger: "bg-red-100 text-red-700 border border-red-200",
        muted: "bg-soft-gray text-text-gray",
      },
    },
    defaultVariants: {
      variant: "champagne",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };