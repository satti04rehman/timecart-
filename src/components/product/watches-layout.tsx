"use client";

import * as React from "react";
import { Filters, type FilterGroup } from "@/components/product/filters";
import { SortControl } from "@/components/product/sort-control";
import { Pagination } from "@/components/product/pagination";
import { ProductRail } from "@/components/product/product-rail";
import type { ProductSummary } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function WatchesLayout({
  products,
  pages,
  page,
  groups,
  total,
}: {
  products: ProductSummary[];
  pages: number;
  page: number;
  groups: FilterGroup[];
  total: number;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="mt-8 flex gap-10 lg:mt-10">
      <Filters
        groups={groups}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <SortControl onOpenFilters={() => setMobileOpen(true)} />

        {products.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <p className="font-heading text-2xl text-obsidian">
              No watches found
            </p>
            <p className="mt-2 max-w-sm text-sm text-text-gray">
              Try adjusting your filters or search for something else.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/watches">Clear all filters</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            <ProductRail products={products} priorityFirst variant="minimal" />
            {pages > 1 && <Pagination page={page} pages={pages} />}
          </div>
        )}
      </div>
    </div>
  );
}