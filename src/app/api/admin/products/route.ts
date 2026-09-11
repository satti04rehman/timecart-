import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { data as demoRows } from "@/lib/demo-admin";

function DB_ERROR() {
  return NextResponse.json({ ok: false, error: "Database operation failed" }, { status: 400 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").toLowerCase();
  const ready = await isDbReady();

  let list;
  if (!ready) {
    list = demoRows;
  } else {
    const rows = await prisma.product.findMany({
      include: { brand: true, category: true, variants: true },
    });
    list = rows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      brand: p.brand?.name ?? "",
      brandSlug: p.brand?.slug ?? "",
      category: p.category?.name ?? "",
      categorySlug: p.category?.slug ?? "",
      price: Number(p.price),
      discount: p.discount,
      stock: p.variants.reduce((s, v) => s + v.stock, 0),
      ratingAvg: Number(p.ratingAvg),
      ratingCount: p.ratingCount,
      imageUrl: p.featuredImageUrl,
      colors: (p.colors as string[]) ?? [],
      movement: p.movement,
    }));
  }

  const filtered = q
    ? list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      )
    : list;

  return NextResponse.json({ products: filtered });
}

export async function POST(req: Request) {
  const body = await req.json();
  const ready = await isDbReady();
  if (ready) {
    try {
      await prisma.product.create({ data: body });
      return NextResponse.json({ ok: true });
    } catch {
      return DB_ERROR();
    }
  }
  return NextResponse.json({ ok: true, demo: true });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }
  const ready = await isDbReady();
  if (ready) {
    try {
      await prisma.product.update({ where: { id }, data });
      return NextResponse.json({ ok: true });
    } catch {
      return DB_ERROR();
    }
  }
  return NextResponse.json({ ok: true, demo: true });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }
  const ready = await isDbReady();
  if (ready) {
    try {
      await prisma.product.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    } catch {
      return DB_ERROR();
    }
  }
  return NextResponse.json({ ok: true, demo: true });
}