import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ customers: [] });

  const rows = await prisma.profile.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { select: { total: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const customers = rows.map((p) => {
    const name = [p.firstName, p.lastName].filter(Boolean).join(" ") || "Guest";
    return {
      id: p.id,
      name,
      email: p.email ?? "",
      phone: p.phone ?? "",
      orders: p.orders.length,
      totalSpent: p.orders.reduce((sum, o) => sum + Number(o.total), 0),
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
    };
  });

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").toLowerCase();
  const filtered = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      )
    : customers;

  return NextResponse.json({ customers: filtered });
}

export async function PATCH(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  let body: { id?: string; active?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const { id, active } = body ?? {};
  if (!id || typeof active !== "boolean") {
    return NextResponse.json(
      { ok: false, error: "Customer id and active state required." },
      { status: 400 }
    );
  }

  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  try {
    const updated = await prisma.profile.update({
      where: { id },
      data: { isActive: active },
      select: { id: true, isActive: true },
    });
    return NextResponse.json({ ok: true, customer: updated });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Customer could not be updated." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Customer id required." },
      { status: 400 }
    );
  }

  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  try {
    await prisma.profile.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Customer could not be deleted." },
      { status: 400 }
    );
  }
}