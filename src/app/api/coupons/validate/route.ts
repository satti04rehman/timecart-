import { NextResponse } from "next/server";
import { getCoupon } from "@/lib/data";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") ?? "";
  if (!code.trim()) {
    return NextResponse.json({ valid: false, error: "Enter a coupon code" });
  }
  const coupon = await getCoupon(code);
  if (!coupon) {
    return NextResponse.json({ valid: false, error: "Invalid coupon code" });
  }
  return NextResponse.json({ valid: true, coupon });
}