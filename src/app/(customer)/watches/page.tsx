import { WatchesLayout } from "@/components/product/watches-layout";
import type { FilterGroup } from "@/components/product/filters";
import { getProducts, getCategories, getBrands } from "@/lib/data";
import { X } from "lucide-react";
import Link from "next/link";

export const dynamic = "auto";
export const revalidate = 60;

interface WatchesPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    brand?: string;
    gender?: string;
    min?: string;
    max?: string;
    rating?: string;
    sort?: string;
    movement?: string;
    style?: string;
    color?: string;
    availability?: string | string[];
    onSale?: string;
    inStock?: string;
  }>;
}

function all(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function WatchesPage({ searchParams }: WatchesPageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1"));
  const q = sp.q;
  const category = sp.category;
  const brand = sp.brand;
  const gender = sp.gender;
  const minPrice = sp.min ? Number(sp.min) : undefined;
  const maxPrice = sp.max ? Number(sp.max) : undefined;
  const rating = sp.rating ? Number(sp.rating) : undefined;
  const avail = all(sp.availability);
  const onSale = avail.includes("on-sale") || sp.onSale === "1";
  const inStock = avail.includes("in-stock") || sp.inStock === "1";

  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);

  const { products, total, pages } = await getProducts({
    category,
    brand,
    gender,
    q,
    minPrice,
    maxPrice,
    minRating: rating,
    onSale,
    inStock,
    movement: sp.movement,
    style: sp.style,
    color: sp.color,
    sort: sp.sort,
  });

  const groups: FilterGroup[] = [
    {
      key: "category",
      label: "Category",
      options: categories.map((c) => ({ value: c.slug, label: c.name })),
    },
    {
      key: "brand",
      label: "Brand",
      options: brands.map((b) => ({ value: b.slug, label: b.name })),
    },
    {
      key: "gender",
      label: "Gender",
      options: [
        { value: "MEN", label: "Men" },
        { value: "WOMEN", label: "Women" },
        { value: "UNISEX", label: "Unisex" },
      ],
    },
    {
      key: "movement",
      label: "Movement",
      options: [
        { value: "quartz", label: "Quartz" },
        { value: "automatic", label: "Automatic" },
        { value: "eco-drive", label: "Eco-Drive" },
        { value: "smart", label: "Smart" },
      ],
    },
    {
      key: "style",
      label: "Style",
      options: [
        { value: "classic", label: "Classic" },
        { value: "sport", label: "Sport" },
        { value: "minimal", label: "Minimal" },
        { value: "casual", label: "Casual" },
      ],
    },
    {
      key: "color",
      label: "Color",
      options: [
        { value: "black", label: "Black" },
        { value: "silver", label: "Silver" },
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
        { value: "gold", label: "Gold" },
      ],
    },
    {
      key: "availability",
      label: "Availability",
      options: [
        { value: "on-sale", label: "On Sale" },
        { value: "in-stock", label: "In Stock" },
      ],
    },
  ];

  const title = q
    ? `Results for "${q}"`
    : category
      ? (categories.find((c) => c.slug === category)?.name ?? "Watches")
      : "All Watches";

  const active = (() => {
    const chips: { label: string; href: string }[] = [];
    if (q) {
      const p = new URLSearchParams();
      Object.entries(sp).forEach(([k, v]) => {
        if (k !== "q" && k !== "sort" && v != null) {
          for (const value of Array.isArray(v) ? v : [v]) p.append(k, value);
        }
      });
      chips.push({ label: `"${q}"`, href: `/watches?${p}` });
    }
    if (category)
      chips.push({
        label: `Category: ${categories.find((c) => c.slug === category)?.name ?? category}`,
        href: "/watches",
      });
    if (brand)
      chips.push({
        label: `Brand: ${brands.find((b) => b.slug === brand)?.name ?? brand}`,
        href: "/watches",
      });
    if (gender) {
      const labels: Record<string, string> = {
        MEN: "Men",
        WOMEN: "Women",
        UNISEX: "Unisex",
      };
      chips.push({
        label: labels[gender] ?? gender.toLowerCase(),
        href: "/watches",
      });
    }
    return chips;
  })();

  return (
    <div className="container-tc py-10 lg:py-14">
      <div className="pt-10 text-center lg:pt-16">
        <p className="text-xs font-light uppercase tracking-[0.45em] text-champagne">
          Time Cart &mdash; The Collection
        </p>
        <h1 className="mt-6 font-heading text-4xl font-extralight uppercase tracking-[0.05em] lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm font-light leading-relaxed tracking-wide text-text-gray">
          The Time Cart collection offers a wide range of timepieces &mdash;
          from everyday classics to statement pieces &mdash; to suit any wrist.
        </p>
        <div className="mx-auto mt-12 h-px w-full max-w-2xl bg-soft-gray" />
        <p className="mt-5 text-[11px] font-light uppercase tracking-[0.35em] text-text-gray">
          {total} result{total === 1 ? "" : "s"}
        </p>
      </div>

      {active.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {active.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="flex items-center gap-1.5 rounded-full border border-soft-gray bg-white px-3 py-1.5 text-xs font-medium text-obsidian transition-colors hover:border-champagne hover:text-champagne"
            >
              {chip.label}
              <X className="h-3 w-3" />
            </Link>
          ))}
          <Link
            href="/watches"
            className="text-xs font-medium text-champagne hover:underline"
          >
            Clear all
          </Link>
        </div>
      )}

      <WatchesLayout
        products={products}
        pages={pages}
        page={page}
        groups={groups}
        total={total}
      />
    </div>
  );
}