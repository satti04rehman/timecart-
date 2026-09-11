"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

export interface AdminProductFormData {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  discount: string;
  stock: string;
  brand: string;
  category: string;
  imageUrl: string;
  movement: string;
}

const EMPTY: AdminProductFormData = {
  name: "",
  slug: "",
  sku: "",
  price: "",
  discount: "",
  stock: "",
  brand: "Casio",
  category: "Casual",
  imageUrl: "",
  movement: "quartz",
};

async function mutate(method: "POST" | "PUT" | "DELETE", body?: unknown, id?: string) {
  const res = await fetch(
    `/api/admin/products${method === "DELETE" ? `?id=${id}` : ""}`,
    {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }
  );
  return res.json();
}

export function ProductsManager() {
  const [rows, setRows] = React.useState<unknown[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<AdminProductFormData | null>(null);

  const load = React.useCallback((q = "") => {
    fetch(`/api/admin/products?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setRows(d.products));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!editing) return;
    const payload = {
      ...(editing.id ? { id: editing.id } : {}),
      name: editing.name,
      slug: editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      sku: editing.sku || `TC-${Date.now().toString().slice(-5)}`,
      price: Number(editing.price) || 0,
      discount: Number(editing.discount) || 0,
      stock: Number(editing.stock) || 0,
      imageUrl: editing.imageUrl || "https://picsum.photos/seed/tc-default/640/640",
      movement: editing.movement,
    };
    const res = await mutate(editing.id ? "PUT" : "POST", payload);
    if (res.ok) {
      toast.success(
        res.demo
          ? "Saved (demo mode — connect Supabase to persist)"
          : "Product saved"
      );
      setEditing(null);
      load(query);
    } else {
      toast.error(res.error ?? "Save failed");
    }
  };

  const remove = async (id: string) => {
    const res = await mutate("DELETE", undefined, id);
    if (res.ok) {
      toast.success(res.demo ? "Deleted (demo mode)" : "Product deleted");
      load(query);
    } else {
      toast.error(res.error ?? "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-ivory">Products</h1>
          <p className="mt-1 text-sm text-ivory/50">
            Manage your catalog, pricing and stock.
          </p>
        </div>
        <Button
          className="gap-1.5 bg-champagne text-obsidian hover:bg-champagne/80"
          onClick={() => setEditing({ ...EMPTY })}
        >
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              load(e.target.value);
            }}
            placeholder="Search products…"
            className="border-ivory/10 bg-ivory text-obsidian placeholder:text-text-gray"
          />
        </div>
      </div>

      {rows === null ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-ivory/5" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ivory/20 p-14 text-center text-ivory/50">
          No products found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-ivory">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-soft-gray text-left text-xs uppercase tracking-wider text-text-gray">
                <th className="py-3 pl-4 pr-4 font-medium">Product</th>
                <th className="py-3 pr-4 font-medium">Brand</th>
                <th className="py-3 pr-4 font-medium">Price</th>
                <th className="py-3 pr-4 font-medium">Rating</th>
                <th className="py-3 pr-4 font-medium">Stock</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p: any) => (
                <tr key={p.id} className="border-b border-soft-gray/60 last:border-0">
                  <td className="py-3 pl-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-soft-gray/50">
                        {p.imageUrl && (
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="44px" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-obsidian">{p.name}</p>
                        <p className="text-xs text-text-gray">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-text-gray">{p.brand}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-obsidian">{formatPrice(p.price * (1 - p.discount / 100))}</p>
                    {p.discount > 0 && (
                      <p className="text-xs text-text-gray line-through">{formatPrice(p.price)}</p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-text-gray">
                    {p.ratingCount > 0 ? `${p.ratingAvg.toFixed(1)}★ (${p.ratingCount})` : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <StockBadge stock={p.stock} />
                  </td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() =>
                          setEditing({
                            id: p.id,
                            name: p.name,
                            slug: p.slug,
                            sku: p.sku,
                            price: String(p.price),
                            discount: String(p.discount),
                            stock: String(p.stock),
                            brand: p.brand,
                            category: p.category,
                            imageUrl: p.imageUrl ?? "",
                            movement: p.movement ?? "quartz",
                          })
                        }
                        className="rounded-lg p-2 text-text-gray transition-colors hover:bg-soft-gray hover:text-obsidian"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        className="rounded-lg p-2 text-text-gray transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
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

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditing(null)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-ivory p-6">
            <h2 className="font-heading text-xl text-obsidian">
              {editing.id ? "Edit Product" : "Add Product"}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name" className="sm:col-span-2">
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field label="SKU">
                <Input value={editing.sku} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} />
              </Field>
              <Field label="Brand">
                <Input value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} />
              </Field>
              <Field label="Price (PKR)">
                <Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
              </Field>
              <Field label="Discount %">
                <Input type="number" value={editing.discount} onChange={(e) => setEditing({ ...editing, discount: e.target.value })} />
              </Field>
              <Field label="Stock">
                <Input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} />
              </Field>
              <Field label="Movement">
                <Input value={editing.movement} onChange={(e) => setEditing({ ...editing, movement: e.target.value })} />
              </Field>
              <Field label="Category" className="sm:col-span-2">
                <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              </Field>
              <Field label="Image URL" className="sm:col-span-2">
                <Input value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} />
              </Field>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-xs text-text-gray">
                <Info className="h-3.5 w-3.5" /> Demo mode = no persistence.
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-medium text-text-gray">{label}</p>
      {children}
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0)
    return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Out of stock</span>;
  if (stock <= 5)
    return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Low · {stock}</span>;
  return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{stock} in stock</span>;
}