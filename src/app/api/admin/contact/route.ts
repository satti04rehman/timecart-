import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ inquiries: [], unreadCount: 0 });

  const url = new URL(req.url);
  const onlyUnread = url.searchParams.get("unread") === "1";

  const rows = await prisma.contactSubmission.findMany({
    where: onlyUnread ? { isRead: false } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const inquiries = rows.map((i) => ({
    id: i.id,
    name: i.name,
    email: i.email,
    subject: i.subject,
    message: i.message,
    isRead: i.isRead,
    createdAt: i.createdAt.toISOString(),
  }));
  const unreadCount = await prisma.contactSubmission.count({ where: { isRead: false } });

  return NextResponse.json({ inquiries, unreadCount });
}

export async function PATCH(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const { id, isRead } = body;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }
  const ready = await isDbReady();
  if (!ready) return NextResponse.json({ ok: true, demo: true });

  try {
    await prisma.contactSubmission.update({
      where: { id },
      data: { isRead: isRead === true },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not update" }, { status: 400 });
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
    await prisma.contactSubmission.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not delete" }, { status: 400 });
  }
}