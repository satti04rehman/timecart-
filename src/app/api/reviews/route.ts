import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { prisma, getPrismaClient } from "@/lib/prisma";

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  content: z.string().trim().min(5).max(2000),
});

export async function POST(req: Request) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a rating and a short review (5+ characters)." },
      { status: 400 }
    );
  }
  const { productId, rating, title, content } = parsed.data;

  const client = getPrismaClient();
  if (!client) {
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true, isActive: true },
    });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "Account not ready yet. Try again in a moment." },
        { status: 400 }
      );
    }

    const existing = await prisma.review.findFirst({
      where: {
        productId,
        profileId: profile.id,
        status: { in: ["APPROVED", "PENDING"] },
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already reviewed this watch." },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          rating,
          title: title || null,
          content,
          status: "PENDING",
          productId,
          profileId: profile.id,
        },
      });

      const agg = await tx.review.aggregate({
        where: { productId, status: "APPROVED" },
        _avg: { rating: true },
        _count: true,
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          ratingAvg: Math.round((agg._avg.rating ?? 0) * 100) / 100,
          ratingCount: agg._count,
        },
      });

      return review;
    });

    revalidatePath("/watches");
    revalidatePath(`/watches/${product.slug}`);

    return NextResponse.json({ ok: true, review: result, pending: true });
  } catch {
    return NextResponse.json(
      { error: "We couldn't save your review. Please try again." },
      { status: 500 }
    );
  }
}