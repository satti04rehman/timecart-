import { DEMO_PRODUCTS } from "@/lib/demo-data";

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  price: number;
  discount: number;
  stock: number;
  ratingAvg: number;
  ratingCount: number;
  imageUrl: string | null;
  colors: string[];
  movement: string | null;
}

export const data: AdminProductRow[] = DEMO_PRODUCTS.map((p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  sku: p.sku,
  brand: p.brand.name,
  brandSlug: p.brand.slug,
  category: p.category.name,
  categorySlug: p.category.slug,
  price: p.price,
  discount: p.discount,
  stock: p.stock,
  ratingAvg: p.ratingAvg,
  ratingCount: p.ratingCount,
  imageUrl: p.imageUrl,
  colors: p.colors ?? [],
  movement: p.movement ?? null,
}));