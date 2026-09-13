"use client";

import * as React from "react";
import type { ProductSummary } from "@/types";
import { ProductGrid } from "@/components/product/product-grid";
import { QuickViewDialog } from "@/components/product/quick-view";

export function ProductRail({
  products,
  columns = 4,
  priorityFirst = false,
  variant = "card",
}: {
  products: ProductSummary[];
  columns?: 2 | 3 | 4;
  priorityFirst?: boolean;
  variant?: "card" | "minimal";
}) {
  const [quickView, setQuickView] = React.useState<ProductSummary | null>(null);

  return (
    <>
      <ProductGrid
        products={products}
        columns={columns}
        priorityFirst={priorityFirst}
        onQuickView={variant === "card" ? setQuickView : undefined}
        variant={variant}
      />
      {variant === "card" && (
        <QuickViewDialog product={quickView} onClose={() => setQuickView(null)} />
      )}
    </>
  );
}