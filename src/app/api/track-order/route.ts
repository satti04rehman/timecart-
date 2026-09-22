import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { rateLimit } from "@/lib/rate-limit";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/order-status";

const NEVER_FOUND = { ok: true, order: null };

export async function GET(req: Request) {
  const rl = rateLimit(req, "track-order", 30, 60 * 1000);
  if (rl.limited) {
    return NextResponse.json(
      { ok: false, error: "Too many lookups. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    );
  }

  const url = new URL(req.url);
  const number = (url.searchParams.get("number") ?? "").trim().toUpperCase();
  const token = (url.searchParams.get("token") ?? "").trim();
  if (!number) {
    return NextResponse.json({ ok: false, error: "Order number required" }, { status: 400 });
  }

  const ready = await isDbReady();
  if (!ready) return NextResponse.json(NEVER_FOUND);

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: number },
      include: { items: true },
    });
    // Orders are only readable with the unguessable token issued at checkout —
    // prevents anyone enumerating order numbers to harvest names/phones/addresses.
    if (!order || !order.trackingToken || !token || order.trackingToken !== token) {
      return NextResponse.json(NEVER_FOUND);
    }

    const shipping = (order.shippingAddress ?? {}) as { address?: string; city?: string };
    return NextResponse.json({
      ok: true,
      order: {
        orderNumber: order.orderNumber,
        date: order.createdAt.toISOString(),
        customerName: order.customerName,
        status: ORDER_STATUS_LABELS[order.status] ?? order.status,
        items: order.items.map((i) => ({
          name: i.productName,
          qty: i.quantity,
          price: Number(i.unitPrice),
        })),
        total: Number(order.total),
        paymentMethod: PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod,
        address: shipping.address ?? "",
        city: shipping.city ?? "",
        phone: order.customerPhone,
      },
    });
  } catch {
    return NextResponse.json(NEVER_FOUND);
  }
}