import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { cn } from "@/lib/utils";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter ?? "all";

  const ready = await isDbReady();
  const rows = ready
    ? await prisma.product.findMany({
        include: {
          variants: { select: { stock: true } },
        },
        orderBy: { name: "asc" },
      })
    : [];

  const items = rows.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    imageUrl: p.featuredImageUrl,
    stock: p.variants.reduce((s, v) => s + v.stock, 0),
  }));

  const buckets = {
    all: items,
    instock: items.filter((i) => i.stock > 5),
    low: items.filter((i) => i.stock > 0 && i.stock <= 5),
    out: items.filter((i) => i.stock <= 0),
  };
  const visible = buckets[filter as keyof typeof buckets] ?? items;

  const filters = [
    { key: "all", label: "All", count: items.length },
    { key: "instock", label: "In Stock", count: buckets.instock.length },
    { key: "low", label: "Low Stock", count: buckets.low.length },
    { key: "out", label: "Out of Stock", count: buckets.out.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-ivory">Inventory</h1>
        <p className="mt-1 text-sm text-ivory/50">
          Low-stock alerts and stock levels per product.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/inventory" : `/admin/inventory?filter=${f.key}`}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-medium transition-colors",
              filter === f.key
                ? "bg-champagne text-obsidian"
                : "bg-ivory/10 text-ivory/70 hover:bg-champagne/60 hover:text-obsidian"
            )}
          >
            {f.label} ({f.count})
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl bg-ivory">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-soft-gray text-left text-xs uppercase tracking-wider text-text-gray">
              <th className="py-3 pl-4 pr-4 font-medium">Product</th>
              <th className="py-3 pr-4 font-medium">SKU</th>
              <th className="py-3 pr-4 font-medium">Stock</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 text-right font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-text-gray">
                  No products in this bucket.
                </td>
              </tr>
            ) : (
              visible.map((p) => (
                <tr key={p.id} className="border-b border-soft-gray/60 last:border-0">
                  <td className="py-3 pl-4 pr-4">
                    <div className="flex items-center gap-3">
                      {p.imageUrl && (
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-soft-gray/50">
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="44px" />
                        </div>
                      )}
                      <span className="font-medium text-obsidian">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-text-gray">{p.sku}</td>
                  <td className="py-3 pr-4 font-medium text-obsidian">{p.stock}</td>
                  <td className="py-3 pr-4">
                    {p.stock <= 0 ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Out of stock</span>
                    ) : p.stock <= 5 ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Low stock</span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">In stock</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <Link
                      href="/admin/products"
                      className="rounded-lg bg-champagne/15 px-3 py-1.5 text-xs font-semibold text-champagne transition-colors hover:bg-champagne/25"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}