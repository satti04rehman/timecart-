import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDbReady } from "@/lib/data";

export async function POST(request: NextRequest) {
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