import Link from "next/link";
import { getProducts } from "@/lib/data";
import { AdminTable } from "@/components/admin/admin-table";

export default async function AdminInventoryPage() {
  const { products } = await getProducts({});
  const rows = products.map((p) => [
    p.name,
    p.sku,
    p.stock <= 0 ? "Out of stock" : p.stock <= 5 ? `Low (${p.stock})` : `${p.stock} in stock`,
    p.stock <= 5 ? "text-amber-600 font-semibold" : p.stock <= 0 ? "text-red-600 font-semibold" : "",
  ]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-ivory">Inventory</h1>
        <p className="mt-1 text-sm text-ivory/50">
          Low-stock alerts and stock levels per product.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {["All", "In Stock", "Low Stock", "Out of Stock"].map((f) => (
          <Link
            key={f}
            href="/admin/inventory"
            className="rounded-full bg-ivory/10 px-4 py-2 text-xs font-medium text-ivory/70 transition-colors hover:bg-champagne hover:text-obsidian"
          >
            {f}
          </Link>
        ))}
      </div>
      <AdminTable
        columns={["Product", "SKU", "Stock", ""]}
        rows={rows}
      />
    </div>
  );
}