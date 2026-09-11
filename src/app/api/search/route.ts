import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(
    Number(request.nextUrl.searchParams.get("limit") ?? "6"),
    12
  );

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const { products } = await getProducts({ q });
  const results = products.slice(0, limit).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand.name,
    price: p.salePrice,
    imageUrl: p.imageUrl,
  }));

  return NextResponse.json({ results });
}