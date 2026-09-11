"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface Coupon {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  expiryDate: string | null;
  isActive: boolean;
}

const SEED: Coupon[] = [
  { code: "WELCOME10", type: "PERCENTAGE", value: 10, minOrder: 5000, maxDiscount: 1500, expiryDate: "2026-12-31", isActive: true },
  { code: "SALE20", type: "PERCENTAGE", value: 20, minOrder: 15000, maxDiscount: 5000, expiryDate: "2026-11-30", isActive: true },
  { code: "FLAT500", type: "FIXED", value: 500, minOrder: 3000, maxDiscount: null, expiryDate: "2026-10-31", isActive: true },
];

async function send(body: unknown) {
  const res = await fetch("/api/admin/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function CouponsManager() {
  const [coupons, setCoupons] = React.useState<Coupon[]>(SEED);
  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minOrder: "0",
    maxDiscount: "",
  });

  const create = async () => {
    if (!form.code.trim()) return;
    const res = await send({
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value) || 0,
      minOrder: Number(form.minOrder) || 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
    });
    if (res.ok) {
      toast.success(res.demo ? "Coupon added (demo mode)" : "Coupon created");
      setCoupons((prev) => [
        {
          code: form.code.toUpperCase(),
          type: form.type as Coupon["type"],
          value: Number(form.value) || 0,
          minOrder: Number(form.minOrder) || 0,
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
          expiryDate: "2026-12-31",
          isActive: true,
        },
        ...prev,
      ]);
      setAdding(false);
      setForm({ code: "", type: "PERCENTAGE", value: "", minOrder: "0", maxDiscount: "" });
    } else {
      toast.error(res.error ?? "Failed to create coupon");
    }
  };

  const toggle = async (code: string) => {
    await send({ code, isActive: !coupons.find((c) => c.code === code)?.isActive });
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const remove = async (code: string) => {
    await send({ code, delete: true });
    setCoupons((prev) => prev.filter((c) => c.code !== code));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-ivory">Coupons</h1>
          <p className="mt-1 text-sm text-ivory/50">
            Promo codes customers can apply at checkout.
          </p>
        </div>
        <Button className="gap-1.5 bg-champagne text-obsidian hover:bg-champagne/80" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> New Coupon
        </Button>
      </div>

      {adding && (
        <div className="rounded-xl bg-ivory p-5">
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
          </div>
          <div className="mt-5 flex gap-2">
            <Button onClick={create}>Create Coupon</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div key={c.code} className="rounded-xl bg-ivory p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-heading text-xl tracking-wider text-obsidian">{c.code}</p>
                <p className="mt-0.5 text-xs text-text-gray">
                  {c.type === "PERCENTAGE" ? `${c.value}% off` : `${formatPrice(c.value)} off`} · min {formatPrice(c.minOrder)}
                </p>
              </div>
              <button
                onClick={() => remove(c.code)}
                className="text-text-gray transition-colors hover:text-red-600"
                aria-label="Delete coupon"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {c.maxDiscount != null && (
              <p className="mt-2 text-xs text-text-gray">Cap: {formatPrice(c.maxDiscount)}</p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => toggle(c.code)}
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
        ))}
      </div>
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