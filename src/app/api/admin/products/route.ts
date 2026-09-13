import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { data as demoRows } from "@/lib/demo-admin";
import { requireAdmin } from "@/lib/require-admin";

function invalidateProductCache(slug?: string) {
  revalidatePath("/watches");
  revalidatePath("/");
  if (slug) revalidatePath(`/watches/${slug}`);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function resolveBrand(name: string): Promise<string> {
  const slug = slugify(name);
  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) return existing.id;
  const created = await prisma.brand.create({
    data: { name: name.trim(), slug },
  });
  return created.id;
}

async function resolveCategory(name: string): Promise<string> {
  const slug = slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return existing.id;
  const created = await prisma.category.create({
    data: { name: name.trim(), slug, isActive: true },
  });
  return created.id;
}

/** Maps the admin form payload onto the Prisma Product shape. */
async function buildProductData(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  if (!name) {
    throw new Error("Product name is required.");
  }
  const slug = String(body.slug ?? "").trim() || slugify(name);
  const sku = String(body.sku ?? "").trim() || `TC-${Date.now().toString().slice(-6)}`;
  const brandName = String(body.brand ?? "").trim() || "TimeCart";
  const categoryName = String(body.category ?? "").trim() || "Watches";

  const brandId = await resolveBrand(brandName);
  const categoryId = await resolveCategory(categoryName);

  const data: Record<string, unknown> = {
    slug,
    sku,
    name,
    brandId,
    categoryId,
    brand: { connect: { id: brandId } },
    category: { connect: { id: categoryId } },
    price: body.price ?? 0,
    discount: body.discount ?? 0,
    featuredImageUrl:
      String(body.featuredImageUrl ?? body.imageUrl ?? "") || null,
    movement: body.movement ?? null,
    isActive: body.isActive !== false,
  };
  return { data, slug, brandId, categoryId };
}

/** Sets/adjusts stock on the product's default variant. */
async function writeStock(productId: string, stock: number) {
  const variant = await prisma.productVariant.findFirst({
    where: { productId },
    orderBy: { isDefault: "desc" },
  });
  const stockStatus =
    stock <= 0 ? "OUT_OF_STOCK" : stock <= 5 ? "LOW_STOCK" : "IN_STOCK";
  if (variant) {
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: { stock, stockStatus },
    });
  } else {
    await prisma.productVariant.create({
      data: {
        name: "Default",
        sku: `${productId}-D`,
        stock,
        stockStatus,
        isDefault: true,
        productId,
      },
    });
  }
}

async function getDetail(id: string) {
  return prisma.product.findUnique({
    where: { id },
    select: { slug: true },
  });
}

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").toLowerCase();
  const ready = await isDbReady();

  let list;
  if (!ready) {
    list = demoRows;
  } else {
    const rows = await prisma.product.findMany({
      include: { brand: true, category: true, variants: true },
      orderBy: { createdAt: "desc" },
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
      isActive: p.isActive,
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
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  try {
    const { data, slug } = await buildProductData(body);
    const product = await prisma.product.create({
      data: data as never,
    });
    const stock = Number(body.stock) || 0;
    await writeStock(product.id, stock);
    invalidateProductCache(slug);
    return NextResponse.json({ ok: true, id: product.id });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }
  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  try {
    const { data, slug } = await buildProductData(body);
    await prisma.product.update({ where: { id }, data: data as never });
    if (body.stock !== undefined && body.stock !== null) {
      await writeStock(id, Number(body.stock) || 0);
    }
    invalidateProductCache(slug);
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Update failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }
  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  try {
    const existing = await getDetail(id);
    await prisma.product.delete({ where: { id } });
    invalidateProductCache(existing?.slug);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not delete product." },
      { status: 400 }
    );
  }
}