"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  country: string | null;
  isActive: boolean;
  productCount: number;
}

interface BrandForm {
  id?: string;
  name: string;
  slug: string;
  country: string;
  description: string;
  isActive: boolean;
}

const EMPTY: BrandForm = { name: "", slug: "", country: "", description: "", isActive: true };

async function call(method: string, body?: unknown, id?: string) {
  const res = await fetch(
    `/api/admin/brands${method === "DELETE" ? `?id=${id}` : ""}`,
    {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }
  );
  return res.json();
}

export function BrandsManager() {
  const [rows, setRows] = React.useState<BrandRow[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<BrandForm | null>(null);

  const load = React.useCallback(() => {
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then((d) => setRows(d.brands));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = {
      ...(editing.id ? { id: editing.id } : {}),
      name: editing.name,
      slug: editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      country: editing.country || undefined,
      description: editing.description || undefined,
      isActive: editing.isActive,
    };
    const res = await call(editing.id ? "PUT" : "POST", payload);
    if (res.ok) {
      toast.success(editing.id ? "Brand updated" : "Brand created");
      setEditing(null);
      load();
    } else {
      toast.error(res.error ?? "Save failed");
    }
  };

  const remove = async (id: string) => {
    const res = await call("DELETE", undefined, id);
    if (res.ok) {
      toast.success("Brand deleted");
      load();
    } else {
      toast.error(res.error ?? "Delete failed");
    }
  };

  const visible = rows ? (query ? rows.filter((b) => b.name.toLowerCase().includes(query.toLowerCase())) : rows) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="admin-eyebrow">Catalog</p>
          <h1 className="admin-title mt-1 text-3xl text-obsidian">Brands</h1>
          <p className="mt-2 text-sm text-text-gray">
            Manage the watch brands you sell.
          </p>
        </div>
        <Button
          className="gap-1.5 bg-champagne text-obsidian hover:bg-champagne/80"
          onClick={() => setEditing({ ...EMPTY })}
        >
          <Plus className="h-4 w-4" /> Add Brand
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brands…"
          className="border-obsidian/10 bg-white text-obsidian placeholder:text-text-gray"
        />
      </div>

      {visible === null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-obsidian/5" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-obsidian/15 p-14 text-center text-text-gray">
          No brands found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-obsidian/10 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-obsidian/10 text-left text-xs uppercase tracking-wider text-text-gray">
                <th className="admin-th py-3 pl-4 pr-4 font-medium">Brand</th>
                <th className="admin-th py-3 pr-4 font-medium">Slug</th>
                <th className="admin-th py-3 pr-4 font-medium">Country</th>
                <th className="py-3 pr-4 font-medium">Products</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((b) => (
                <tr key={b.id} className="border-b border-obsidian/5 last:border-0">
                  <td className="py-3 pl-4 pr-4 font-medium text-obsidian">{b.name}</td>
                  <td className="py-3 pr-4 text-text-gray">/{b.slug}</td>
                  <td className="py-3 pr-4 text-text-gray">{b.country ?? "—"}</td>
                  <td className="py-3 pr-4 text-text-gray">{b.productCount}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-soft-gray text-text-gray"}`}>
                      {b.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() =>
                          setEditing({
                            id: b.id,
                            name: b.name,
                            slug: b.slug,
                            country: b.country ?? "",
                            description: b.description ?? "",
                            isActive: b.isActive,
                          })
                        }
                        className="rounded-lg p-2 text-text-gray transition-colors hover:bg-soft-gray hover:text-obsidian"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(b.id)}
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
          <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="font-heading text-xl text-obsidian">
              {editing.id ? "Edit Brand" : "Add Brand"}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name" className="sm:col-span-2">
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field label="Slug" className="sm:col-span-2">
                <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="Auto-generated from name" />
              </Field>
              <Field label="Country">
                <Input value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} placeholder="Switzerland" />
              </Field>
              <Field label="Active">
                <label className="flex h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-soft-gray px-3">
                  <input
                    type="checkbox"
                    checked={editing.isActive}
                    onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                    className="h-4 w-4 accent-obsidian"
                  />
                  <span className="text-sm text-obsidian">Visible on storefront</span>
                </label>
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-medium text-text-gray">{label}</p>
      {children}
    </div>
  );
}