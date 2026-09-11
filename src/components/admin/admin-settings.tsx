"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DEFAULTS = {
  storeName: "TimeCart",
  tagline: "Where Time Meets Style.",
  currency: "PKR",
  supportPhone: "+92 300 1234567",
  supportEmail: "support@timecart.pk",
  freeShippingAbove: "10000",
  shippingFee: "199",
  codEnabled: true,
  maxCod: "60000",
};

export function AdminSettings() {
  const [form, setForm] = React.useState(DEFAULTS);
  const [saved, setSaved] = React.useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("tc-admin-settings", JSON.stringify(form));
    setSaved(true);
    toast.success("Settings saved (this browser)");
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (
    key: "codEnabled",
    value: boolean
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-ivory">Settings</h1>
        <p className="mt-1 text-sm text-ivory/50">
          Store configuration used across the storefront.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl bg-ivory p-6">
        <h2 className="font-heading text-lg text-obsidian">Store Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Store Name">
            <Input
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
            />
          </Field>
          <Field label="Tagline">
            <Input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </Field>
          <Field label="Support Phone">
            <Input
              value={form.supportPhone}
              onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
            />
          </Field>
          <Field label="Support Email">
            <Input
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="max-w-2xl rounded-xl bg-ivory p-6">
        <h2 className="font-heading text-lg text-obsidian">Pricing & Delivery</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Free Shipping Above (PKR)">
            <Input
              type="number"
              value={form.freeShippingAbove}
              onChange={(e) => setForm({ ...form, freeShippingAbove: e.target.value })}
            />
          </Field>
          <Field label="Flat Fee (PKR)">
            <Input
              type="number"
              value={form.shippingFee}
              onChange={(e) => setForm({ ...form, shippingFee: e.target.value })}
            />
          </Field>
          <Field label="Max COD (PKR)">
            <Input
              type="number"
              value={form.maxCod}
              onChange={(e) => setForm({ ...form, maxCod: e.target.value })}
            />
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-lg border border-soft-gray p-4">
          <div>
            <p className="text-sm font-medium text-obsidian">Cash on Delivery</p>
            <p className="text-xs text-text-gray">
              Allow customers to pay on delivery.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggle("codEnabled", !form.codEnabled)}
            className={`relative h-6 w-11 rounded-full transition-colors ${form.codEnabled ? "bg-champagne" : "bg-soft-gray"}`}
            aria-label="Toggle COD"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${form.codEnabled ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" className="gap-2">
          {saved && <Check className="h-4 w-4" />}
          {saved ? "Saved" : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-text-gray">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}