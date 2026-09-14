"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
}

interface CategoryForm {
  id?: string;
  name: string;
  slug: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY: CategoryForm = { name: "", slug: "", imageUrl: "", sortOrder: "0", isActive: true };

async function call(method: string, body?: unknown, id?: string) {
  const res = await fetch(
    `/api/admin/categories${method === "DELETE" ? `?id=${id}` : ""}`,
    {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }
  );
  return res.json();
}

export function CategoriesManager() {
  const [rows, setRows] = React.useState<CategoryRow[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<CategoryForm | null>(null);

  const load = React.useCallback(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setRows(d.categories));
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
      imageUrl: editing.imageUrl || undefined,
      sortOrder: Number(editing.sortOrder) || 0,
      isActive: editing.isActive,
    };
    const res = await call(editing.id ? "PUT" : "POST", payload);
    if (res.ok) {
      toast.success(editing.id ? "Category updated" : "Category created");
      setEditing(null);
      load();
    } else {
      toast.error(res.error ?? "Save failed");
    }
  };

  const remove = async (id: string) => {
    const res = await call("DELETE", undefined, id);
    if (res.ok) {
      toast.success("Category deleted");
      load();
    } else {
      toast.error(res.error ?? "Delete failed");
    }
  };

  const visible = rows ? (query ? rows.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())) : rows) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="admin-eyebrow">Catalog</p>
          <h1 className="admin-title mt-1 text-3xl text-obsidian">Categories</h1>
          <p className="mt-2 text-sm text-text-gray">
            Collection categories shown on the storefront.
          </p>
        </div>
        <Button
          className="gap-1.5 bg-champagne text-obsidian hover:bg-champagne/80"
          onClick={() => setEditing({ ...EMPTY })}
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories…"
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
          No categories found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-obsidian/10 bg-white">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-obsidian/10 text-left text-xs uppercase tracking-wider text-text-gray">
                <th className="admin-th py-3 pl-4 pr-4 font-medium">Category</th>
                <th className="admin-th py-3 pr-4 font-medium">Slug</th>
                <th className="admin-th py-3 pr-4 font-medium">Products</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Order</th>
                <th className="py-3 pr-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} className="border-b border-obsidian/5 last:border-0">
                  <td className="py-3 pl-4 pr-4">
                    <div className="flex items-center gap-3">
                      {c.imageUrl && (
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-soft-gray/50">
                          <Image src={c.imageUrl} alt={c.name} fill className="object-cover" sizes="44px" />
                        </div>
                      )}
                      <span className="font-medium text-obsidian">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-text-gray">/{c.slug}</td>
                  <td className="py-3 pr-4 text-text-gray">{c.productCount}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-soft-gray text-text-gray"}`}>
                      {c.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-text-gray">{c.sortOrder}</td>
                  <td className="py-3 pr-4">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() =>
                          setEditing({
                            id: c.id,
                            name: c.name,
                            slug: c.slug,
                            imageUrl: c.imageUrl ?? "",
                            sortOrder: String(c.sortOrder),
                            isActive: c.isActive,
                          })
                        }
                        className="rounded-lg p-2 text-text-gray transition-colors hover:bg-soft-gray hover:text-obsidian"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(c.id)}
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
              {editing.id ? "Edit Category" : "Add Category"}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name" className="sm:col-span-2">
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field label="Slug" className="sm:col-span-2">
                <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="Auto-generated from name" />
              </Field>
              <Field label="Sort order">
                <Input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: e.target.value })} />
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
              <Field label="Image URL" className="sm:col-span-2">
                <Input value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} placeholder="https://…" />
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