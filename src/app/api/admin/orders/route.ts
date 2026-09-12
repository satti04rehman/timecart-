import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

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

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  return NextResponse.json({ orders: DEMO_ORDERS });
}

export async function PUT(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const { number, status } = body;
  if (!number || !status)
    return NextResponse.json({ ok: false, error: "Order number and status required" }, { status: 400 });
  // Demo mode — no persistence. When Supabase is wired, this updates the Order row.
  return NextResponse.json({ ok: true, demo: true });
}