import { NextResponse } from "next/server";
import { getCoupon } from "@/lib/data";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const rl = rateLimit(req, "coupon-validate", 20, 60 * 1000);
  if (rl.limited) {
    return NextResponse.json({ valid: false, error: "Too many requests. Try again shortly." }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
    });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code") ?? "";
  if (!code.trim()) {
    return NextResponse.json({ valid: false, error: "Enter a coupon code" });
  }
  const coupon = await getCoupon(code);
  if (!coupon) {
    return NextResponse.json({ valid: false, error: "Invalid coupon code" });
  }
  // Expose only what the cart needs, not coupon limits/admin details.
  return NextResponse.json({
    valid: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    },
  });
}