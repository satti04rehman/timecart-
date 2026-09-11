"use client";

import * as React from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
}

function readAddresses(): Address[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("tc-addresses") ?? "[]");
  } catch {
    return [];
  }
}

export function AddressesPage() {
  const [addresses, setAddresses] = React.useState<Address[]>(() =>
    readAddresses()
  );
  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState({
    label: "Home",
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });

  const persist = (next: Address[]) => {
    localStorage.setItem("tc-addresses", JSON.stringify(next));
    setAddresses(next);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const item: Address = {
      id: `addr-${Date.now()}`,
      ...form,
    };
    persist([...addresses, item]);
    setAdding(false);
    setForm({ label: "Home", fullName: "", phone: "", address: "", city: "" });
  };

  const remove = (id: string) =>
    persist(addresses.filter((a) => a.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-obsidian">
            Saved Addresses
          </h2>
          <p className="mt-1 text-sm text-text-gray">
            Used for faster checkout.
          </p>
        </div>
        <Button onClick={() => setAdding((v) => !v)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {adding && (
        <form
          onSubmit={save}
          className="rounded-xl border-2 border-champagne/40 bg-white p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Label</Label>
              <div className="mt-1.5">
                <Input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Home / Office"
                />
              </div>
            </div>
            <div>
              <Label>Full Name</Label>
              <div className="mt-1.5">
                <Input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  placeholder="Ali Hassan"
                  required
                />
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <div className="mt-1.5">
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="03XX-XXXXXXX"
                  required
                />
              </div>
            </div>
            <div>
              <Label>City</Label>
              <div className="mt-1.5">
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Karachi"
                  required
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Street Address</Label>
              <div className="mt-1.5">
                <Textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="House #, Street, Area"
                  rows={2}
                  required
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <Button type="submit">Save Address</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAdding(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !adding ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-soft-gray p-14 text-center">
          <MapPin className="h-10 w-10 text-text-gray" />
          <p className="mt-4 font-heading text-xl text-obsidian">
            No saved addresses
          </p>
          <p className="mt-2 text-sm text-text-gray">
            Save your delivery addresses here for one-tap checkout.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between rounded-xl border border-soft-gray bg-white p-5"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-champagne">
                  {a.label}
                </p>
                <p className="mt-2 text-sm font-medium text-obsidian">
                  {a.fullName}
                </p>
                <p className="mt-0.5 text-sm text-text-gray">
                  {a.address}, {a.city}
                  <br />
                  {a.phone}
                </p>
              </div>
              <button
                onClick={() => remove(a.id)}
                className="text-text-gray transition-colors hover:text-red-600"
                aria-label="Delete address"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}