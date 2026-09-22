import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { rateLimit } from "@/lib/rate-limit";
import { PAYMENT_LABEL_TO_METHOD } from "@/lib/order-status";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

const MAX_QTY = 10;
const FREE_SHIPPING_OVER = 10000;
const SHIPPING_FEE = 199;
const DEPOSIT_THRESHOLD = 60000;
const DEPOSIT_RATE = 0.5;

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

function clampQty(n: number): number {
  return Math.min(MAX_QTY, Math.max(1, Math.floor(n) || 0));
}

function salePrice(price: number, discountPercent: number): number {
  return Math.max(0, Math.round(price * (100 - discountPercent)) / 100);
}

export async function POST(req: Request) {
  const rl = rateLimit(req, "orders", 10, 60 * 1000);
  if (rl.limited) {
    return NextResponse.json(
      { ok: false, error: "Too many orders. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    );
  }

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

  // Demo mode has no server-side catalog to price against — client totals
  // stay (nothing is really charged, orders live in localStorage).
  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  try {
    const paymentLabel = String(body.paymentMethod ?? "Cash on Delivery");
    const paymentMethod =
      PAYMENT_LABEL_TO_METHOD[paymentLabel] ??
      (paymentLabel === "Bank Transfer" ? "BANK_TRANSFER" : "CASH_ON_DELIVERY");

    // ----- Server-side pricing: the client never decides money values. -----
    const slugs = items
      .map((i) => i.productId)
      .filter(Boolean)
      .map(String);
    const variantsNeeded = items.filter((i) => i.variantId).map((i) => i.variantId as string);

    const [products, variants] = await Promise.all([
      slugs.length
        ? prisma.product.findMany({
            where: { slug: { in: slugs } },
            select: { id: true, slug: true, sku: true, price: true, discount: true },
          })
        : Promise.resolve([]),
      variantsNeeded.length
        ? prisma.productVariant.findMany({
            where: { id: { in: variantsNeeded } },
            select: { id: true, productId: true, price: true },
          })
        : Promise.resolve([]),
    ]);

    const productBySlug = new Map(products.map((p) => [p.slug, p]));
    const skuBySlug = new Map(products.map((p) => [p.slug, p.sku]));
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    const pricedItems: OrderItemInput[] = [];
    let subtotal = 0;
    for (const item of items) {
      const product = item.productId ? productBySlug.get(item.productId) : undefined;
      // Unknown/deleted product → refuse the order rather than trust a price.
      if (!product) {
        return NextResponse.json(
          { ok: false, error: "One of the items in your cart is unavailable. Please refresh and try again." },
          { status: 400 }
        );
      }
      const basePrice = item.variantId
        ? Number(variantMap.get(item.variantId)?.price ?? product.price)
        : Number(product.price);
      const unitPrice = salePrice(basePrice, Number(product.discount) || 0);
      const quantity = clampQty(item.quantity);
      if (unitPrice <= 0 || (item.variantId && !variantMap.has(item.variantId as string))) {
        return NextResponse.json(
          { ok: false, error: "One of the items in your cart is unavailable. Please refresh and try again." },
          { status: 400 }
        );
      }
      pricedItems.push({ ...item, unitPrice, quantity });
      subtotal += unitPrice * quantity;
    }

    const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;

    // ----- Coupon enforced server-side, not echoed from the client. -----
    const couponCode = body.couponCode ? String(body.couponCode).toUpperCase() : null;
    let coupon: { id: string; type: string; value: number; maxDiscount: number | null } | null = null;
    let couponDiscount = 0;
    if (couponCode) {
      const row = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (row && row.isActive) {
        const expired = row.expiryDate && row.expiryDate.getTime() < Date.now();
        const exhausted = row.usageLimit != null && row.usedCount >= row.usageLimit;
        if (!expired && !exhausted && Number(row.minOrder) <= subtotal) {
          coupon = { id: row.id, type: row.type, value: Number(row.value), maxDiscount: row.maxDiscount ? Number(row.maxDiscount) : null };
          const raw =
            row.type === "PERCENTAGE" ? (subtotal * Number(row.value)) / 100 : Number(row.value);
          couponDiscount = Math.min(raw, coupon.maxDiscount ?? raw, subtotal);
        }
      }
    }

    const total = Math.max(0, subtotal - couponDiscount) + shipping;
    const deposit =
      paymentMethod === "BANK_TRANSFER" && total > DEPOSIT_THRESHOLD
        ? Math.round(total * DEPOSIT_RATE * 100) / 100
        : 0;

    // ----- Order number + unguessable tracking token (prevents enumeration). -----
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
    const trackingToken = crypto.randomUUID();

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
          trackingToken,
          customerName: name,
          customerEmail: String(body.customerEmail ?? "").trim(),
          customerPhone: phone,
          subtotal,
          shipping,
          discount: couponDiscount,
          tax: 0,
          total,
          couponCode,
          couponDiscount,
          status: "PLACED",
          paymentMethod: paymentMethod as never,
          paymentStatus: "PENDING",
          shippingMethod: "STANDARD",
          shippingAddress: { address, city },
          profileId: sameProfile,
          items: {
            create: pricedItems.map((i) => ({
              productName: i.name,
              sku: i.sku ?? skuBySlug.get(i.productId ?? "") ?? "—",
              imageUrl: i.imageUrl ?? null,
              variantName: i.variantName ?? null,
              unitPrice: i.unitPrice,
              quantity: i.quantity,
              total: i.unitPrice * i.quantity,
              productId: i.productId ?? null,
            })),
          },
        },
      });

      for (const item of pricedItems) {
        const qty = item.quantity;
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

      if (coupon && couponDiscount > 0) {
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

    return NextResponse.json({
      ok: true,
      id: result.id,
      orderNumber,
      trackingToken,
      totals: { subtotal, shipping, discount: couponDiscount, total },
    });
  } catch (e) {
    console.error("[api/orders] failed", e);
    return NextResponse.json(
      { ok: false, error: "We couldn't place your order. Please try again." },
      { status: 500 }
    );
  }
}