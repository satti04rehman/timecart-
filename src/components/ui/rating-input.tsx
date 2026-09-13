"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  className?: string;
}

export function RatingInput({
  value,
  onChange,
  size = 32,
  className,
}: RatingInputProps) {
  const [hovered, setHovered] = React.useState(0);

  return (
    <div className={cn("flex items-center gap-1", className)} role="radiogroup">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const active = hovered > 0 ? star <= hovered : star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="rounded-sm p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(
                "transition-colors",
                active
                  ? "fill-champagne text-champagne"
                  : "text-soft-gray"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}