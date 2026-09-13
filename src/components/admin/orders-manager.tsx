"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_OPTIONS } from "@/lib/order-status";

interface AdminOrder {
  id?: string;
  number: string;
  customer: string;
  phone: string;
  items: number;
  total: number;
  payment: string;
  status: string;
  date: string;
  city: string;
}

const STATUSES = ORDER_STATUS_OPTIONS;

const STATUS_BADGE: Record<string, string> = {
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

export function OrdersManager() {
  const [orders, setOrders] = React.useState<AdminOrder[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");

  React.useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders));
  }, []);

  const changeStatus = async (number: string, id: string | undefined, status: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number, id, status }),
    });
    const data = await res.json();
    if (data.ok) {
      toast.success(data.demo ? "Status updated (demo mode)" : "Order updated");
      setOrders((prev) =>
        prev
          ? prev.map((o) => (o.number === number ? { ...o, status } : o))
          : prev
      );
    } else {
      toast.error(data.error ?? "Update failed");
    }
  };

  const filtered = (orders ?? []).filter((o) => {
    const matchesQuery =
      !query ||
      o.number.toLowerCase().includes(query.toLowerCase()) ||
      o.customer.toLowerCase().includes(query.toLowerCase()) ||
      o.phone.includes(query);
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-ivory">Orders</h1>
        <p className="mt-1 text-sm text-ivory/50">
          Track, verify and update customer orders.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order, customer, phone…"
            className="border-ivory/10 bg-ivory text-obsidian placeholder:text-text-gray"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-ivory/10 bg-ivory px-3 text-sm text-obsidian outline-none"
        >
          <option>All</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {orders === null ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-ivory/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ivory/20 p-14 text-center text-ivory/50">
          No orders match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-ivory">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-soft-gray text-left text-xs uppercase tracking-wider text-text-gray">
                <th className="py-3 pl-4 pr-4 font-medium">Order</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Items</th>
                <th className="py-3 pr-4 font-medium">Total</th>
                <th className="py-3 pr-4 font-medium">Payment</th>
                <th className="py-3 pr-4 font-medium">Date</th>
                <th className="py-3 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.number} className="border-b border-soft-gray/60 last:border-0">
                  <td className="py-3 pl-4 pr-4 font-semibold text-obsidian">{o.number}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-obsidian">{o.customer}</p>
                    <p className="text-xs text-text-gray">{o.phone} · {o.city}</p>
                  </td>
                  <td className="py-3 pr-4 text-text-gray">{o.items}</td>
                  <td className="py-3 pr-4 font-semibold text-obsidian">{formatPrice(o.total)}</td>
                  <td className="py-3 pr-4 text-text-gray">{o.payment}</td>
                  <td className="py-3 pr-4 text-text-gray">
                    {new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o.number, o.id, e.target.value)}
                      className={`rounded-lg border-0 px-2.5 py-1.5 text-xs font-semibold outline-none ${STATUS_BADGE[o.status] ?? ""}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}