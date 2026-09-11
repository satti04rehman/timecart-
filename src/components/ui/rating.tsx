import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  size?: "sm" | "md";
  className?: string;
  showValue?: boolean;
}

export function Rating({
  value,
  size = "sm",
  className,
  showValue = false,
}: RatingProps) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.3 && value - full < 0.8;
  const display = Math.round(value);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full) {
            return (
              <Star
                key={i}
                className={cn(sizeClass, "fill-champagne text-champagne")}
              />
            );
          }
          if (i === full && hasHalf) {
            return (
              <StarHalf
                key={i}
                className={cn(sizeClass, "fill-champagne text-champagne")}
              />
            );
          }
          return (
            <Star key={i} className={cn(sizeClass, "text-soft-gray")} />
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs text-text-gray">{display.toFixed(1)}</span>
      )}
    </div>
  );
}