import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/order-status";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const number = (url.searchParams.get("number") ?? "").trim().toUpperCase();
  if (!number) {
    return NextResponse.json({ ok: false, error: "Order number required" }, { status: 400 });
  }

  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: false, order: null });

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: number },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ ok: true, order: null });

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
    return NextResponse.json({ ok: true, order: null });
  }
}