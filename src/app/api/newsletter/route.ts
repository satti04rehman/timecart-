import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, "newsletter", 5, 60 * 1000);
  if (rl.limited) {
    return NextResponse.json(
      { error: "Too many signups. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    );
  }

  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const ready = await isDbReady();
    if (ready) {
      try {
        await prisma.newsletterSubscriber.upsert({
          where: { email },
          update: { isActive: true },
          create: { email },
        });
      } catch {
        // non-fatal — newsletter storage unavailable
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}