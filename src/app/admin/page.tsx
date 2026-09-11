import {
  getProducts,
  getCategories,
  getBrands,
} from "@/lib/data";
import {
  StatCard,
  RevenueChart,
  CategoryChart,
} from "@/components/admin/dashboard-charts";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [productsRes, categories, brands] = await Promise.all([
    getProducts({}),
    getCategories(),
    getBrands(),
  ]);

  const lowStock = productsRes.products.filter((p) => p.stock <= 5).length;

  const stats = {
    products: productsRes.total,
    categories: categories.length,
    brands: brands.length,
    revenue: 1284750,
    orders: 342,
    customers: 189,
    lowStock,
    reviews: productsRes.products.reduce((s, p) => s + p.ratingCount, 0),
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

  const statusColor: Record<string, string> = {
    Processing: "bg-amber-100 text-amber-700",
    "Awaiting Deposit": "bg-blue-100 text-blue-700",
    Dispatched: "bg-violet-100 text-violet-700",
    Delivered: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-ivory">Dashboard</h1>
        <p className="mt-1 text-sm text-ivory/50">
          Overview of your store performance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatPrice(stats.revenue)} sub="All time, PKR" accent />
        <StatCard label="Products" value={String(stats.products)} sub={`${lowStock} low on stock`} />
        <StatCard label="Orders" value={String(stats.orders)} sub={`${stats.customers} customers`} />
        <StatCard label="Reviews" value={String(stats.reviews)} sub={`${stats.categories} categories · ${stats.brands} brands`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <RevenueChart data={stats.revenueSeries} />
        <CategoryChart data={stats.topCategories} />
      </div>

      {/* Recent orders */}
      <div className="rounded-xl bg-ivory p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-gray">Latest activity</p>
            <p className="font-heading text-xl text-obsidian">Recent Orders</p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-soft-gray text-left text-xs uppercase tracking-wider text-text-gray">
                <th className="py-2.5 pr-4 font-medium">Order</th>
                <th className="py-2.5 pr-4 font-medium">Customer</th>
                <th className="py-2.5 pr-4 font-medium">Total</th>
                <th className="py-2.5 pr-4 font-medium">Status</th>
                <th className="py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.number} className="border-b border-soft-gray/60 last:border-0">
                  <td className="py-3 pr-4 font-semibold text-obsidian">{o.number}</td>
                  <td className="py-3 pr-4 text-text-gray">{o.customer}</td>
                  <td className="py-3 pr-4 font-medium text-obsidian">{formatPrice(o.total)}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-text-gray">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}