import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { requireAdmin } from "@/lib/require-admin";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ brands: [] });

  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({
    brands: brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      description: b.description,
      country: b.country,
      isActive: b.isActive,
      productCount: b._count.products,
    })),
  });
}

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  }
  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  try {
    const brand = await prisma.brand.create({
      data: {
        name,
        slug: String(body.slug ?? "").trim() || slugify(name),
        logoUrl: body.logoUrl ? String(body.logoUrl) : null,
        description: body.description ? String(body.description) : null,
        country: body.country ? String(body.country) : null,
        isActive: body.isActive !== false,
      },
    });
    revalidatePath("/watches");
    return NextResponse.json({ ok: true, id: brand.id });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Create failed" },
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

  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  }

  try {
    await prisma.brand.update({
      where: { id },
      data: {
        name,
        slug: String(body.slug ?? "").trim() || slugify(name),
        logoUrl: body.logoUrl ? String(body.logoUrl) : null,
        description: body.description ? String(body.description) : null,
        country: body.country ? String(body.country) : null,
        isActive: body.isActive !== false,
      },
    });
    revalidatePath("/watches");
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
    await prisma.brand.delete({ where: { id } });
    revalidatePath("/watches");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Cannot delete brand with products. Remove its products first." },
      { status: 400 }
    );
  }
}