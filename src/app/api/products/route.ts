import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const all = url.searchParams.get("all") === "1";
  const ids = (url.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const list: { id: string }[] = [];
  if (all || ids.length > 0) {
    for (let page = 1; ; page++) {
      const { products, pages } = await getProducts({ page });
      list.push(...products);
      if (page >= pages) break;
    }
  } else {
    list.push(...(await getProducts({})).products);
  }

  if (ids.length > 0) {
    const byId = list.filter((p) => ids.includes(p.id));
    return NextResponse.json({ products: byId });
  }

  return NextResponse.json({ products: list });
}