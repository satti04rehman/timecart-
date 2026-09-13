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