import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await req.json();
    const { code, delete: isDelete, isActive } = body;
    if (!code)
      return NextResponse.json({ ok: false, error: "Coupon code required" }, { status: 400 });
    // Demo mode — no persistence. When Supabase is wired, this upserts/deletes the Coupon row.
    void isDelete;
    void isActive;
    return NextResponse.json({ ok: true, demo: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}