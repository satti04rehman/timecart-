"use client";

import Link from "next/link";
import type { ProductSummary } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: ProductSummary[];
  columns?: 2 | 3 | 4;
  priorityFirst?: boolean;
  onQuickView?: (product: ProductSummary) => void;
  variant?: "card" | "minimal";
}

export function ProductGrid({
  products,
  columns = 4,
  priorityFirst = false,
  onQuickView,
  variant = "card",
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6",
        columns >= 3 && "md:grid-cols-3",
        columns >= 4 && "lg:grid-cols-4"
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={onQuickView}
          priority={priorityFirst && index === 0}
          variant={variant}
        />
      ))}
    </div>
  );
}