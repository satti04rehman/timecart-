import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ coupons: [] });

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    coupons: coupons.map((c) => ({
      id: c.id,
      code: c.code,
      type: c.type,
      value: Number(c.value),
      minOrder: Number(c.minOrder),
      maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
      expiryDate: c.expiryDate?.toISOString() ?? null,
      usageLimit: c.usageLimit,
      usedCount: c.usedCount,
      isActive: c.isActive,
    })),
  });
}

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ ok: false, error: "Coupon code required" }, { status: 400 });
  }
  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  const type = body.type === "FIXED" ? "FIXED" : "PERCENTAGE";
  const value = Number(body.value);
  if (!isFinite(value) || value <= 0) {
    return NextResponse.json({ ok: false, error: "Enter a valid discount value" }, { status: 400 });
  }
  const expiryDate = body.expiryDate ? new Date(String(body.expiryDate)) : null;
  if (expiryDate && Number.isNaN(expiryDate.getTime())) {
    return NextResponse.json({ ok: false, error: "Invalid expiry date" }, { status: 400 });
  }

  try {
    await prisma.coupon.upsert({
      where: { code },
      update: {
        type,
        value,
        minOrder: Number(body.minOrder) || 0,
        maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
        expiryDate,
        usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
        isActive: body.isActive !== false,
      },
      create: {
        code,
        type,
        value,
        minOrder: Number(body.minOrder) || 0,
        maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
        expiryDate,
        usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Coupon could not be saved." }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const url = new URL(req.url);
  const code = (url.searchParams.get("code") ?? "").toUpperCase();
  if (!code) {
    return NextResponse.json({ ok: false, error: "Missing code" }, { status: 400 });
  }
  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  try {
    await prisma.coupon.delete({ where: { code } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Coupon could not be deleted." }, { status: 400 });
  }
}