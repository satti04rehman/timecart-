import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { requireAdmin } from "@/lib/require-admin";

async function recomputeProductRating(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true },
  });
  if (!product) return;
  const agg = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      ratingAvg: Math.round((agg._avg.rating ?? 0) * 100) / 100,
      ratingCount: agg._count,
    },
  });
  revalidatePath("/watches");
  revalidatePath(`/watches/${product.slug}`);
}

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "ALL";
  const q = (url.searchParams.get("q") ?? "").toLowerCase();

  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ reviews: [], pendingCount: 0 });

  const where = {
    ...(status === "ALL"
      ? {}
      : { status: status as "PENDING" | "APPROVED" | "HIDDEN" }),
  };
  const rows = await prisma.review.findMany({
    where,
    include: {
      product: { select: { id: true, name: true, slug: true } },
      profile: { select: { firstName: true, lastName: true, email: true } },
      images: { select: { url: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const pendingCount = await prisma.review.count({ where: { status: "PENDING" } });

  const reviews = rows.map((r) => ({
    id: r.id,
    productName: r.product.name,
    productSlug: r.product.slug,
    author: r.profile.firstName && r.profile.lastName
      ? `${r.profile.firstName} ${r.profile.lastName}`
      : r.profile.email ?? "Anonymous",
    rating: r.rating,
    title: r.title,
    content: r.content,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    imageCount: r.images.length,
    images: r.images.map((i) => i.url),
  }));

  const filtered = q
    ? reviews.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          r.author.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q)
      )
    : reviews;

  return NextResponse.json({ reviews: filtered, pendingCount });
}

export async function PATCH(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const { id, status } = body;
  if (!id || !["APPROVED", "PENDING", "HIDDEN"].includes(status)) {
    return NextResponse.json(
      { ok: false, error: "Review id and valid status required" },
      { status: 400 }
    );
  }

  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  try {
    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true, productId: true },
    });
    if (!review) {
      return NextResponse.json({ ok: false, error: "Review not found" }, { status: 404 });
    }
    await prisma.review.update({ where: { id }, data: { status } });
    await recomputeProductRating(review.productId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Review could not be updated." },
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
    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true, productId: true },
    });
    if (!review) {
      return NextResponse.json({ ok: false, error: "Review not found" }, { status: 404 });
    }
    await prisma.review.delete({ where: { id } });
    await recomputeProductRating(review.productId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Review could not be deleted." },
      { status: 400 }
    );
  }
}