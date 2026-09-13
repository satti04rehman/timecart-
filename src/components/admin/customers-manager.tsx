"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
}

export function CustomersManager() {
  const [rows, setRows] = React.useState<CustomerRow[] | null>(null);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/customers?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setRows(d.customers);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-ivory">Customers</h1>
        <p className="mt-1 text-sm text-ivory/50">
          Everyone who has an account on TimeCart.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="border-ivory/10 bg-ivory text-obsidian placeholder:text-text-gray"
        />
      </div>

      {rows === null ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-ivory/5" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ivory/20 p-14 text-center text-ivory/50">
          No customers found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-ivory">
          <table className="w-full min-w-[740px] text-sm">
            <thead>
              <tr className="border-b border-soft-gray text-left text-xs uppercase tracking-wider text-text-gray">
                <th className="py-3 pl-4 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Orders</th>
                <th className="py-3 pr-4 font-medium">Total spent</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-soft-gray/60 last:border-0">
                  <td className="py-3 pl-4 pr-4">
                    <p className="font-medium text-obsidian">{c.name}</p>
                    <p className="text-xs text-text-gray">{c.email || "—"} · {c.phone || "no phone"}</p>
                  </td>
                  <td className="py-3 pr-4 text-text-gray">{c.orders}</td>
                  <td className="py-3 pr-4 font-semibold text-obsidian">
                    {c.totalSpent > 0 ? formatPrice(c.totalSpent) : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-soft-gray text-text-gray"}`}>
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-text-gray">
                    {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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