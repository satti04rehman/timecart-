"use client";

import * as React from "react";
import type { ProductSummary } from "@/types";
import { ProductGrid } from "@/components/product/product-grid";
import { QuickViewDialog } from "@/components/product/quick-view";

export function ProductRail({
  products,
  columns = 4,
  priorityFirst = false,
}: {
  products: ProductSummary[];
  columns?: 2 | 3 | 4;
  priorityFirst?: boolean;
}) {
  const [quickView, setQuickView] = React.useState<ProductSummary | null>(null);

  return (
    <>
      <ProductGrid
        products={products}
        columns={columns}
        priorityFirst={priorityFirst}
        onQuickView={setQuickView}
      />
      <QuickViewDialog product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}