import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { PAYMENT_LABEL_TO_METHOD } from "@/lib/order-status";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

interface OrderItemInput {
  name: string;
  productId?: string;
  sku?: string;
  variantId?: string | null;
  variantName?: string | null;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
}

function clamp(n: number) {
  return Math.max(0, Math.floor(n));
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const name = String(body.customerName ?? "").trim();
  const phone = String(body.customerPhone ?? "").trim();
  const address = String(body.address ?? "").trim();
  const city = String(body.city ?? "").trim();
  if (!name || !phone || !address || !city) {
    return NextResponse.json(
      { ok: false, error: "Name, phone, address and city are required" },
      { status: 400 }
    );
  }
  const items = Array.isArray(body.items) ? (body.items as OrderItemInput[]) : [];
  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "Cart is empty" }, { status: 400 });
  }

  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  try {
    const paymentLabel = String(body.paymentMethod ?? "Cash on Delivery");
    const paymentMethod =
      PAYMENT_LABEL_TO_METHOD[paymentLabel] ??
      (paymentLabel === "Bank Transfer" ? "BANK_TRANSFER" : "CASH_ON_DELIVERY");

    const subtotal = Number(body.subtotal) || 0;
    const shipping = Number(body.shipping) || 0;
    const discount = Number(body.discount) || 0;
    const total = Number(body.total) || Math.max(0, subtotal - discount) + shipping;
    const deposit = Number(body.deposit) || 0;

    const couponCode = body.couponCode ? String(body.couponCode).toUpperCase() : null;
    const couponDiscount = Number(body.couponDiscount) || discount;

    const itemsBySku = new Map<string, string>();
    const productSlugs = items
      .map((i) => i.productId)
      .filter(Boolean)
      .map(String);
    const productsToResolve: { slug: string; sku?: string }[] = [];
    if (productSlugs.length > 0) {
      const found = await prisma.product.findMany({
        where: { slug: { in: productSlugs } },
        select: { id: true, slug: true, sku: true },
      });
      for (const p of found) itemsBySku.set(p.slug, p.sku);
    }

    let orderNumber = String(body.orderNumber ?? "").trim();
    if (!orderNumber) {
      orderNumber = `TC-${Date.now().toString().slice(-6)}`;
    }
    const collision = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });
    if (collision) {
      orderNumber = `TC-${Date.now().toString().slice(-9)}`;
    }

    let coupon: { id: string } | null = null;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: { code: couponCode, isActive: true },
        select: { id: true },
      });
    }

    const sameProfile = await (async () => {
      try {
        const supabase = await createSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;
        const profile = await prisma.profile.findUnique({
          where: { userId: user.id },
          select: { id: true },
        });
        return profile?.id ?? null;
      } catch {
        return null;
      }
    })();

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: name,
          customerEmail: String(body.customerEmail ?? "").trim(),
          customerPhone: phone,
          subtotal,
          shipping,
          discount,
          tax: 0,
          total,
          couponCode,
          couponDiscount: couponDiscount && coupon ? couponDiscount : 0,
          status: deposit > 0 ? "PLACED" : "PLACED",
          paymentMethod: paymentMethod as never,
          paymentStatus: "PENDING",
          shippingMethod: "STANDARD",
          shippingAddress: { address, city },
          profileId: sameProfile,
          items: {
            create: items.map((i) => ({
              productName: i.name,
              sku: i.sku ?? itemsBySku.get(i.productId ?? "") ?? "—",
              imageUrl: i.imageUrl ?? null,
              variantName: i.variantName ?? null,
              unitPrice: Number(i.unitPrice) || 0,
              quantity: clamp(i.quantity),
              total: (Number(i.unitPrice) || 0) * clamp(i.quantity),
              productId: i.productId ?? null,
            })),
          },
        },
      });

      for (const item of items) {
        const qty = clamp(item.quantity);
        if (!qty) continue;
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });
          if (variant) {
            const newStock = Math.max(0, variant.stock - qty);
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                stock: newStock,
                stockStatus:
                  newStock <= 0 ? "OUT_OF_STOCK" : newStock <= 5 ? "LOW_STOCK" : "IN_STOCK",
              },
            });
          }
        } else if (item.productId) {
          const defaultVariant = await tx.productVariant.findFirst({
            where: { productId: item.productId, isDefault: true },
            orderBy: { isDefault: "desc" },
          });
          if (defaultVariant) {
            const newStock = Math.max(0, defaultVariant.stock - qty);
            await tx.productVariant.update({
              where: { id: defaultVariant.id },
              data: {
                stock: newStock,
                stockStatus:
                  newStock <= 0 ? "OUT_OF_STOCK" : newStock <= 5 ? "LOW_STOCK" : "IN_STOCK",
              },
            });
          }
        }
      }

      if (coupon && couponDiscount) {
        await tx.couponUsage.create({
          data: {
            orderId: order.id,
            couponId: coupon.id,
            profileId: sameProfile,
            discount: couponDiscount,
          },
        });
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      return order;
    });

    return NextResponse.json({ ok: true, id: result.id, orderNumber });
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn't place your order. Please try again." },
      { status: 500 }
    );
  }
}