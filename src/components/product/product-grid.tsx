"use client";

import Link from "next/link";
import type { ProductSummary } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: ProductSummary[];
  columns?: 2 | 3 | 4;
  onQuickView?: (product: ProductSummary) => void;
}

export function ProductGrid({
  products,
  columns = 4,
  onQuickView,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6",
        columns >= 3 && "md:grid-cols-3",
        columns >= 4 && "lg:grid-cols-4"
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
}