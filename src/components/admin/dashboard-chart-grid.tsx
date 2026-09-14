"use client";

import * as React from "react";

const RevenueChart = React.lazy(() =>
  import("./dashboard-charts").then((m) => ({ default: m.RevenueChart }))
);
const CategoryChart = React.lazy(() =>
  import("./dashboard-charts").then((m) => ({ default: m.CategoryChart }))
);

function ChartSkeleton() {
  return (
    <div className="admin-card px-6 py-5">
      <div className="h-4 w-24 animate-pulse rounded bg-obsidian/10" />
      <div className="mt-2 h-6 w-32 animate-pulse rounded bg-obsidian/10" />
      <div className="mt-6 h-72 animate-pulse rounded bg-obsidian/5" />
    </div>
  );
}

export function DashboardCharts({
  revenueSeries,
  topCategories,
}: {
  revenueSeries: { month: string; revenue: number; orders: number }[];
  topCategories: { name: string; count: number }[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <React.Suspense fallback={<ChartSkeleton />}>
        <RevenueChart data={revenueSeries} />
      </React.Suspense>
      <React.Suspense fallback={<ChartSkeleton />}>
        <CategoryChart data={topCategories} />
      </React.Suspense>
    </div>
  );
}