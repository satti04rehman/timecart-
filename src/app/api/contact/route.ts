import { NextResponse } from "next/server";
import { isDbReady } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, orderNumber, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Name, email and message are required" },
        { status: 400 }
      );
    }

    const ready = await isDbReady();
    if (ready) {
      await prisma.contactSubmission.create({
        data: {
          name,
          email,
          subject: subject || "General Inquiry",
          message,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not submit your message" },
      { status: 500 }
    );
  }
}