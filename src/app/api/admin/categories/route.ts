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
  if (!ready) return NextResponse.json({ categories: [] });

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl,
      isActive: c.isActive,
      sortOrder: c.sortOrder,
      productCount: c._count.products,
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
    const category = await prisma.category.create({
      data: {
        name,
        slug: String(body.slug ?? "").trim() || slugify(name),
        imageUrl: body.imageUrl ? String(body.imageUrl) : null,
        isActive: body.isActive !== false,
        sortOrder: Number(body.sortOrder) || 0,
      },
    });
    revalidatePath("/watches");
    return NextResponse.json({ ok: true, id: category.id });
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
    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: String(body.slug ?? "").trim() || slugify(name),
        imageUrl: body.imageUrl ? String(body.imageUrl) : null,
        isActive: body.isActive !== false,
        sortOrder: Number(body.sortOrder) || 0,
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
    await prisma.category.delete({ where: { id } });
    revalidatePath("/watches");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Cannot delete category with products. Remove its products first." },
      { status: 400 }
    );
  }
}