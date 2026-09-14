import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { unstable_cache } from "next/cache";
import { StatCard } from "@/components/admin/admin-stat-card";
import { DashboardCharts } from "@/components/admin/dashboard-chart-grid";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

interface DashboardStats {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  categories: number;
  brands: number;
  lowStock: number;
  reviews: number;
  pendingReviews: number;
  revenueSeries: { month: string; revenue: number; orders: number }[];
  topCategories: { name: string; count: number }[];
  recentOrders: {
    number: string;
    customer: string;
    total: number;
    status: string;
    date: string;
  }[];
}

const FALLBACK: DashboardStats = {
  revenue: 1284750,
  orders: 342,
  customers: 189,
  products: 24,
  categories: 6,
  brands: 8,
  lowStock: 3,
  reviews: 97,
  pendingReviews: 0,
  revenueSeries: [
    { month: "Apr", revenue: 145000, orders: 42 },
    { month: "May", revenue: 182000, orders: 55 },
    { month: "Jun", revenue: 168000, orders: 48 },
    { month: "Jul", revenue: 214000, orders: 63 },
    { month: "Aug", revenue: 261000, orders: 74 },
    { month: "Sep", revenue: 320000, orders: 96 },
  ],
  topCategories: [
    { name: "Dress", count: 6 },
    { name: "Sport", count: 6 },
    { name: "Smart", count: 4 },
    { name: "Casual", count: 5 },
    { name: "Luxury", count: 2 },
  ],
  recentOrders: [
    { number: "TC-220191", customer: "Ahmed R.", total: 28750, status: "Processing", date: "Sep 10" },
    { number: "TC-220192", customer: "Fatima S.", total: 56400, status: "Awaiting Deposit", date: "Sep 10" },
    { number: "TC-220193", customer: "Bilal K.", total: 12900, status: "Dispatched", date: "Sep 09" },
    { number: "TC-220194", customer: "Mariam T.", total: 84500, status: "Delivered", date: "Sep 08" },
    { number: "TC-220195", customer: "Umar A.", total: 31000, status: "Delivered", date: "Sep 07" },
  ],
};

async function buildStats(): Promise<DashboardStats> {
  const ready = await isDbReady();
  if (!ready) return FALLBACK;

  const [orders, products, categoryCount, brandCount, customerCount, reviewCount, pendingReviews] =
    await Promise.all([
      prisma.order.findMany({
        select: { total: true, orderNumber: true, customerName: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        include: { variants: { select: { stock: true } }, category: { select: { name: true } } },
      }),
      prisma.category.count(),
      prisma.brand.count(),
      prisma.profile.count({ where: { role: "CUSTOMER" } }),
      prisma.review.count({ where: { status: "APPROVED" } }),
      prisma.review.count({ where: { status: "PENDING" } }),
    ]);

  const activeOrders = orders.filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED");
  const revenue = activeOrders.reduce((s, o) => s + Number(o.total), 0);

  const now = new Date();
  const monthKeys: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push({
      key: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`,
      label: m.toLocaleString("en-US", { month: "short" }),
    });
  }
  const revenueSeries = monthKeys.map(({ key, label }) => {
    const bucket = orders.filter((o) => {
      const c = o.createdAt;
      return `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, "0")}` === key;
    });
    return {
      month: label,
      revenue: bucket.reduce((s, o) => s + Number(o.total), 0),
      orders: bucket.length,
    };
  });

  const catCounts = new Map<string, number>();
  for (const p of products) {
    if (p.category) catCounts.set(p.category.name, (catCounts.get(p.category.name) ?? 0) + 1);
  }
  const topCategories = [...catCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const lowStock = products.filter((p) =>
    p.variants.reduce((s, v) => s + v.stock, 0) <= 5
  ).length;

  const recentOrders = orders.slice(0, 5).map((o) => ({
    number: o.orderNumber,
    customer: o.customerName,
    total: Number(o.total),
    status: ORDER_STATUS_LABELS[o.status] ?? o.status,
    date: o.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return {
    revenue,
    orders: orders.length,
    customers: customerCount,
    products: products.length,
    categories: categoryCount,
    brands: brandCount,
    lowStock,
    reviews: reviewCount,
    pendingReviews,
    revenueSeries,
    topCategories,
    recentOrders,
  };
}

const buildStatsCached = unstable_cache(buildStats, ["admin-dashboard"], {
  revalidate: 60,
});

const statusColor: Record<string, string> = {
  Processing: "bg-amber-100 text-amber-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Packed: "bg-violet-100 text-violet-700",
  Shipped: "bg-fuchsia-100 text-fuchsia-700",
  "Out for Delivery": "bg-indigo-100 text-indigo-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
  Returned: "bg-orange-100 text-orange-700",
  Refunded: "bg-slate-200 text-slate-700",
};

export default async function AdminDashboardPage() {
  const stats = await buildStatsCached();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="admin-eyebrow">Store Overview</p>
          <h1 className="admin-title mt-2 text-3xl text-obsidian lg:text-4xl">
            Dashboard
          </h1>
        </div>
        {stats.pendingReviews > 0 && (
          <a
            href="/admin/reviews"
            className="flex items-center gap-2 border-b border-champagne pb-0.5 text-[11px] font-light uppercase tracking-[0.3em] text-champagne transition-colors hover:text-obsidian"
          >
            {stats.pendingReviews} review{stats.pendingReviews > 1 ? "s" : ""} pending approval
          </a>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatPrice(stats.revenue)} sub="All time, PKR" accent />
        <StatCard label="Products" value={String(stats.products)} sub={`${stats.lowStock} low on stock`} />
        <StatCard label="Orders" value={String(stats.orders)} sub={`${stats.customers} customers`} />
        <StatCard label="Reviews" value={String(stats.reviews)} sub={`${stats.categories} categories · ${stats.brands} brands`} />
      </div>

      <DashboardCharts
        revenueSeries={stats.revenueSeries}
        topCategories={stats.topCategories}
      />

      {/* Recent orders */}
      <div className="admin-card">
        <div className="flex items-center justify-between border-b border-obsidian/10 px-6 py-5">
          <div>
            <p className="admin-eyebrow">Latest activity</p>
            <p className="admin-title mt-1 text-xl text-obsidian">Recent Orders</p>
          </div>
        </div>
        <div className="overflow-x-auto px-6 py-4">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-obsidian/10 text-left">
                <th className="admin-th py-2.5 pr-4 font-medium">Order</th>
                <th className="admin-th py-2.5 pr-4 font-medium">Customer</th>
                <th className="admin-th py-2.5 pr-4 font-medium">Total</th>
                <th className="admin-th py-2.5 pr-4 font-medium">Status</th>
                <th className="admin-th py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-gray">
                    No orders yet. Orders placed at checkout will appear here.
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((o) => (
                  <tr key={o.number} className="border-b border-obsidian/8 last:border-0">
                    <td className="py-3 pr-4 font-medium text-obsidian">{o.number}</td>
                    <td className="py-3 pr-4 text-text-gray">{o.customer}</td>
                    <td className="py-3 pr-4 font-medium text-obsidian">{formatPrice(o.total)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] ${statusColor[o.status] ?? "bg-soft-gray text-text-gray"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-text-gray">{o.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}