"use client";

import * as React from "react";
import { Search, Ban, RotateCcw, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  const [confirmDelete, setConfirmDelete] = React.useState<CustomerRow | null>(null);

  const load = React.useCallback((q = query) => {
    fetch(`/api/admin/customers?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setRows(d.customers));
  }, [query]);

  React.useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (c: CustomerRow) => {
    const next = !c.isActive;
    const res = await fetch("/api/admin/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, active: next }),
    });
    const data = await res.json();
    if (data.ok) {
      toast.success(
        next ? `${c.name} can sign in again.` : `${c.name} has been blocked from signing in.`
      );
      setRows((prev) =>
        prev ? prev.map((r) => (r.id === c.id ? { ...r, isActive: next } : r)) : prev
      );
    } else {
      toast.error(data.error ?? "Couldn't update customer.");
    }
  };

  const performDelete = async (c: CustomerRow) => {
    const res = await fetch(`/api/admin/customers?id=${c.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      toast.success(`${c.name} has been deleted.`);
      setRows((prev) => (prev ? prev.filter((r) => r.id !== c.id) : prev));
    } else {
      toast.error(data.error ?? "Couldn't delete customer.");
    }
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="admin-eyebrow">Accounts</p>
        <h1 className="admin-title mt-1 text-3xl text-obsidian">Customers</h1>
        <p className="mt-2 text-sm text-text-gray">
          Everyone who has an account on TimeCart — block a customer to stop them signing in, or delete their account.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="border-obsidian/10 bg-white text-obsidian placeholder:text-text-gray"
        />
      </div>

      {rows === null ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-obsidian/5" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-obsidian/15 p-14 text-center text-text-gray">
          No customers found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-obsidian/10 bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-obsidian/10 text-left text-xs uppercase tracking-wider text-text-gray">
                <th className="admin-th pl-4">Customer</th>
                <th className="admin-th">Orders</th>
                <th className="admin-th">Total spent</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Joined</th>
                <th className="admin-th pr-4">Manage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className={`border-b border-obsidian/5 last:border-0 ${c.isActive ? "" : "bg-obsidian/[0.02]"}`}
                >
                  <td className="py-3 pl-4 pr-4">
                    <p className={`font-medium ${c.isActive ? "text-obsidian" : "text-text-gray"}`}>{c.name}</p>
                    <p className="text-xs text-text-gray">{c.email || "—"} · {c.phone || "no phone"}</p>
                  </td>
                  <td className="py-3 pr-4 text-text-gray">{c.orders}</td>
                  <td className="py-3 pr-4 font-semibold text-obsidian">
                    {c.totalSpent > 0 ? formatPrice(c.totalSpent) : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {c.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-text-gray">
                    {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      {c.isActive ? (
                        <button
                          onClick={() => toggleActive(c)}
                          className="flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-200"
                        >
                          <Ban className="h-3.5 w-3.5" /> Block
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleActive(c)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-200"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Unblock
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDelete(c)}
                        className="rounded-lg p-2 text-text-gray transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete customer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-obsidian/60 p-4 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-lg text-obsidian">Delete customer?</h2>
            <p className="mt-2 text-sm text-text-gray">
              This permanently deletes <span className="font-semibold text-obsidian">{confirmDelete.name}</span>,
              their reviews and favorites. Their past orders stay on record. This cannot be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border border-obsidian/15 px-4 py-2.5 text-sm font-semibold text-obsidian transition-colors hover:bg-obsidian/5"
              >
                Cancel
              </button>
              <button
                onClick={() => performDelete(confirmDelete)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}