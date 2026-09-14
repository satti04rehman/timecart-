"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  expiryDate: string | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
}

async function send(body: unknown) {
  const res = await fetch("/api/admin/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function removeCoupon(code: string) {
  const res = await fetch(`/api/admin/coupons?code=${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
  return res.json();
}

export function CouponsManager() {
  const [coupons, setCoupons] = React.useState<Coupon[] | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minOrder: "0",
    maxDiscount: "",
    usageLimit: "",
    expiryDate: "",
  });

  const load = React.useCallback(() => {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => setCoupons(d.coupons));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!form.code.trim()) {
      toast.error("Code is required");
      return;
    }
    const res = await send({
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value) || 0,
      minOrder: Number(form.minOrder) || 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      expiryDate: form.expiryDate || undefined,
    });
    if (res.ok) {
      toast.success(res.demo ? "Coupon saved (demo mode)" : "Coupon created");
      setAdding(false);
      setForm({ code: "", type: "PERCENTAGE", value: "", minOrder: "0", maxDiscount: "", usageLimit: "", expiryDate: "" });
      load();
    } else {
      toast.error(res.error ?? "Failed to create coupon");
    }
  };

  const toggle = async (c: Coupon) => {
    const res = await send({ code: c.code, isActive: !c.isActive });
    if (res.ok) {
      setCoupons((prev) =>
        prev
          ? prev.map((x) => (x.code === c.code ? { ...x, isActive: !c.isActive } : x))
          : prev
      );
    } else {
      toast.error(res.error ?? "Update failed");
    }
  };

  const remove = async (c: Coupon) => {
    const res = await removeCoupon(c.code);
    if (res.ok) {
      toast.success("Coupon deleted");
      load();
    } else {
      toast.error(res.error ?? "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="admin-eyebrow">Promotions</p>
          <h1 className="admin-title mt-1 text-3xl text-obsidian">Coupons</h1>
          <p className="mt-2 text-sm text-text-gray">
            Promo codes customers can apply at checkout.
          </p>
        </div>
        <Button className="gap-1.5 bg-champagne text-obsidian hover:bg-champagne/80" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> New Coupon
        </Button>
      </div>

      {adding && (
        <div className="rounded-xl border border-obsidian/10 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Code">
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SAVE10"
                className="uppercase"
              />
            </Field>
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="h-10 w-full rounded-lg border border-soft-gray bg-white px-3 text-sm text-obsidian outline-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed amount (PKR)</option>
              </select>
            </Field>
            <Field label={form.type === "PERCENTAGE" ? "Value (%)" : "Amount (PKR)"}>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </Field>
            <Field label="Min order (PKR)">
              <Input
                type="number"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
              />
            </Field>
            <Field label="Max discount (optional)">
              <Input
                type="number"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
              />
            </Field>
            <Field label="Usage limit (optional)">
              <Input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                placeholder="Unlimited"
              />
            </Field>
            <Field label="Expiry date (optional)">
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
            </Field>
          </div>
          <div className="mt-5 flex gap-2">
            <Button onClick={create}>Create Coupon</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {coupons === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-obsidian/5" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-obsidian/15 p-14 text-center text-text-gray">
          No coupons yet. Create your first promo code.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => {
            const expired =
              c.expiryDate && new Date(c.expiryDate).getTime() < Date.now();
            const fullyUsed =
              c.usageLimit != null && c.usedCount >= c.usageLimit;
            return (
              <div key={c.id} className="rounded-xl border border-obsidian/10 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-heading text-xl tracking-wider text-obsidian">{c.code}</p>
                    <p className="mt-0.5 text-xs text-text-gray">
                      {c.type === "PERCENTAGE" ? `${c.value}% off` : `${formatPrice(c.value)} off`} · min {formatPrice(c.minOrder)}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(c)}
                    className="text-text-gray transition-colors hover:text-red-600"
                    aria-label="Delete coupon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {c.maxDiscount != null && (
                  <p className="mt-2 text-xs text-text-gray">Cap: {formatPrice(c.maxDiscount)}</p>
                )}
                <p className="mt-1 text-xs text-text-gray">
                  {c.usageLimit != null
                    ? `${c.usedCount}/${c.usageLimit} used`
                    : `${c.usedCount} used`}
                  {c.expiryDate &&
                    ` · Expires ${new Date(c.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                  {(expired || fullyUsed) && (
                    <span className="ml-1 font-semibold text-red-500">(unavailable)</span>
                  )}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => toggle(c)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${c.isActive ? "bg-champagne" : "bg-soft-gray"}`}
                    aria-label="Toggle coupon"
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${c.isActive ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                  <span className={`text-xs font-medium ${c.isActive ? "text-emerald-600" : "text-text-gray"}`}>
                    {c.isActive ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-text-gray">{label}</p>
      {children}
    </div>
  );
}