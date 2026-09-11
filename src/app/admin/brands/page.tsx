import { getBrands } from "@/lib/data";
import { AdminTable } from "@/components/admin/admin-table";

export default async function AdminBrandsPage() {
  const brands = await getBrands();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-ivory">Brands</h1>
        <p className="mt-1 text-sm text-ivory/50">
          Watch brands sold on TimeCart.
        </p>
      </div>
      <AdminTable
        columns={["Brand", "Slug", "Category"]}
        rows={brands.map((b) => [b.name, `/${b.slug}`, "Watches"])}
      />
    </div>
  );
}