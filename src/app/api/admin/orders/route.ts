import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import {
  ORDER_STATUS_LABELS,
  ORDER_LABEL_TO_STATUS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/order-status";

const DEMO_ORDERS = [
  { number: "TC-220191", customer: "Ahmed R.", phone: "0300-1234567", items: 2, total: 28750, payment: "Cash on Delivery", status: "Processing", date: "2026-09-10", city: "Karachi" },
  { number: "TC-220192", customer: "Fatima S.", phone: "0311-9876543", items: 1, total: 56400, payment: "Bank Transfer", status: "Awaiting Deposit", date: "2026-09-10", city: "Lahore" },
  { number: "TC-220193", customer: "Bilal K.", phone: "0345-1122334", items: 1, total: 12900, payment: "Cash on Delivery", status: "Dispatched", date: "2026-09-09", city: "Islamabad" },
  { number: "TC-220194", customer: "Mariam T.", phone: "0333-5544778", items: 3, total: 84500, payment: "Bank Transfer", status: "Delivered", date: "2026-09-08", city: "Karachi" },
  { number: "TC-220195", customer: "Umar A.", phone: "0321-6677889", items: 1, total: 31000, payment: "Cash on Delivery", status: "Delivered", date: "2026-09-07", city: "Faisalabad" },
  { number: "TC-220196", customer: "Hira M.", phone: "0302-9988776", items: 2, total: 46250, payment: "Cash on Delivery", status: "Processing", date: "2026-09-06", city: "Multan" },
  { number: "TC-220197", customer: "Zain B.", phone: "0312-4433221", items: 1, total: 18200, payment: "Bank Transfer", status: "Awaiting Deposit", date: "2026-09-05", city: "Rawalpindi" },
  { number: "TC-220198", customer: "Sana K.", phone: "0346-7766554", items: 1, total: 6400, payment: "Cash on Delivery", status: "Delivered", date: "2026-09-04", city: "Hyderabad" },
];

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ orders: DEMO_ORDERS });

  if (id) {
    const detail = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { id: "asc" },
        },
      },
    });
    if (!detail) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const shipping = (detail.shippingAddress ?? {}) as Record<string, unknown>;
    return NextResponse.json({
      order: {
        id: detail.id,
        number: detail.orderNumber,
        customerName: detail.customerName,
        customerEmail: detail.customerEmail,
        customerPhone: detail.customerPhone,
        status: detail.status,
        statusLabel: ORDER_STATUS_LABELS[detail.status] ?? detail.status,
        paymentMethod: detail.paymentMethod,
        paymentMethodLabel:
          PAYMENT_METHOD_LABELS[detail.paymentMethod] ?? detail.paymentMethod,
        paymentStatus: detail.paymentStatus,
        shippingMethod: detail.shippingMethod,
        subtotal: Number(detail.subtotal),
        discount: Number(detail.discount),
        shipping: Number(detail.shipping),
        tax: Number(detail.tax),
        couponCode: detail.couponCode,
        couponDiscount: Number(detail.couponDiscount),
        total: Number(detail.total),
        shippingAddress: shipping,
        estimatedDelivery: detail.estimatedDelivery?.toISOString() ?? null,
        deliveredAt: detail.deliveredAt?.toISOString() ?? null,
        notes: detail.notes,
        createdAt: detail.createdAt.toISOString(),
        items: detail.items.map((i) => ({
          id: i.id,
          productName: i.productName,
          sku: i.sku,
          imageUrl: i.imageUrl,
          variantName: i.variantName,
          unitPrice: Number(i.unitPrice),
          quantity: i.quantity,
          total: Number(i.total),
        })),
      },
    });
  }

  const rows = await prisma.order.findMany({
    include: { items: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const orders = rows.map((o) => {
    const shipping = (o.shippingAddress ?? {}) as { city?: string; address?: string };
    return {
      id: o.id,
      number: o.orderNumber,
      customer: o.customerName,
      phone: o.customerPhone,
      items: o.items.length,
      total: Number(o.total),
      payment: PAYMENT_METHOD_LABELS[o.paymentMethod] ?? o.paymentMethod,
      status: ORDER_STATUS_LABELS[o.status] ?? o.status,
      date: o.createdAt.toISOString(),
      city: shipping.city ?? shipping.address ?? "",
    };
  });

  return NextResponse.json({ orders });
}

export async function PUT(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const { number, id, status } = body;
  if (!number && !id)
    return NextResponse.json(
      { ok: false, error: "Order number required" },
      { status: 400 }
    );
  const enumStatus = ORDER_LABEL_TO_STATUS[status] ?? ORDER_LABEL_TO_STATUS[status] ?? status;
  if (!enumStatus)
    return NextResponse.json(
      { ok: false, error: "Invalid status" },
      { status: 400 }
    );

  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  try {
    await prisma.order.update({
      where: id ? { id } : { orderNumber: number },
      data: {
        status: enumStatus as never,
        deliveredAt: enumStatus === "DELIVERED" ? new Date() : null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Order could not be updated." },
      { status: 400 }
    );
  }
}