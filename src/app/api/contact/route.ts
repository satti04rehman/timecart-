import { NextResponse } from "next/server";
import { isDbReady } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const rl = rateLimit(req, "contact", 5, 60 * 1000);
  if (rl.limited) {
    return NextResponse.json(
      { ok: false, error: "Too many messages. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    );
  }

  try {
    const body = await req.json();
    const { name, email, phone, subject, orderNumber, message } = body;

    const cleanName = String(name ?? "").trim();
    const cleanEmail = String(email ?? "").trim();
    const cleanMessage = String(message ?? "").trim();
    if (!cleanName || !cleanName.length) {
      return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
    }
    if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json({ ok: false, error: "A valid email is required" }, { status: 400 });
    }
    if (!cleanMessage || cleanMessage.length < 3) {
      return NextResponse.json({ ok: false, error: "Message is required" }, { status: 400 });
    }

    const ready = await isDbReady();
    if (ready) {
      const orderSubject = orderNumber
        ? `Order ${String(orderNumber).toUpperCase()} — ${subject || "General Inquiry"}`
        : subject || "General Inquiry";
      const enrichedMessage = phone
        ? `${cleanMessage}\n\nContact phone: ${phone}`
        : cleanMessage;
      await prisma.contactSubmission.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          subject: orderSubject,
          message: enrichedMessage,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/contact] failed", e);
    return NextResponse.json(
      { ok: false, error: "Could not submit your message" },
      { status: 500 }
    );
  }
}