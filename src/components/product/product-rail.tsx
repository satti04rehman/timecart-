"use client";

import * as React from "react";
import type { ProductSummary } from "@/types";
import { ProductGrid } from "@/components/product/product-grid";
import { QuickViewDialog } from "@/components/product/quick-view";

export function ProductRail({
  products,
  columns = 4,
}: {
  products: ProductSummary[];
  columns?: 2 | 3 | 4;
}) {
  const [quickView, setQuickView] = React.useState<ProductSummary | null>(null);

  return (
    <>
      <ProductGrid
        products={products}
        columns={columns}
        onQuickView={setQuickView}
      />
      <QuickViewDialog product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}