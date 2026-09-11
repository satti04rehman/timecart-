import Image from "next/image";
import { getCategories } from "@/lib/data";
import { AdminTable } from "@/components/admin/admin-table";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-ivory">Categories</h1>
        <p className="mt-1 text-sm text-ivory/50">
          Collection categories shown on the storefront.
        </p>
      </div>
      <AdminTable
        columns={["Category", "Slug", "Products", "Image"]}
        rows={categories.map((c) => [
          c.name,
          `/${c.slug}`,
          "—",
          c.imageUrl
            ? {
                img: c.imageUrl,
                alt: c.name,
              }
            : "None",
        ])}
      />
    </div>
  );
}