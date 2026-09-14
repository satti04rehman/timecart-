"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

export interface AdminStats {
  products: number;
  categories: number;
  brands: number;
  revenue: number;
  orders: number;
  customers: number;
  lowStock: number;
  reviews: number;
  revenueSeries: { month: string; revenue: number; orders: number }[];
  topCategories: { name: string; count: number }[];
  recentOrders: { number: string; customer: string; total: number; status: string; date: string }[];
}

export function RevenueChart({ data }: { data: AdminStats["revenueSeries"] }) {
  return (
    <div className="admin-card px-6 py-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="admin-eyebrow">Revenue</p>
          <p className="admin-title mt-1 text-xl text-obsidian">Last 6 months</p>
        </div>
      </div>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C6A15B" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#C6A15B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E7E5E0" strokeDasharray="4 4" />
            <XAxis dataKey="month" tick={{ fill: "#666666", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#666666", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              contentStyle={{
                background: "#111111",
                border: "1px solid rgba(247,245,240,0.15)",
                borderRadius: 2,
                color: "#F7F5F0",
                fontSize: 13,
              }}
              labelStyle={{ color: "#C6A15B", fontWeight: 500 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#C6A15B"
              strokeWidth={2}
              fill="url(#rev)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CategoryChart({
  data,
}: {
  data: AdminStats["topCategories"];
}) {
  return (
    <div className="admin-card px-6 py-5">
      <p className="admin-eyebrow">Inventory</p>
      <p className="admin-title mt-1 text-xl text-obsidian">By Category</p>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#E7E5E0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#666666", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#666666", fontSize: 12 }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#111111",
                border: "1px solid rgba(247,245,240,0.15)",
                borderRadius: 2,
                color: "#F7F5F0",
                fontSize: 13,
              }}
              cursor={{ fill: "#E7E5E0", opacity: 0.4 }}
            />
            <Bar dataKey="count" name="Products" fill="#C6A15B" radius={[1, 1, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
