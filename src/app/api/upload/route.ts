import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, getPrismaClient } from "@/lib/prisma";

const uploadSchema = z.object({
  dataUrl: z.string().min(10),
});

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "No image data provided." }, { status: 400 });
  }
  const raw = parsed.data.dataUrl.trim();

  if (!/^data:image\/[a-z0-9.+-]+;base64,/i.test(raw)) {
    return NextResponse.json(
      { error: "Unsupported format — please upload an image (JPEG, PNG, WebP)." },
      { status: 400 }
    );
  }
  const base64 = raw.split(",")[1] ?? "";
  if (base64.length > MAX_BYTES * 1.34) {
    return NextResponse.json(
      { error: "Image is too large (max 4 MB)." },
      { status: 413 }
    );
  }

  const client = getPrismaClient();
  if (!client) {
    return NextResponse.json({ ok: true, demo: true, url: raw });
  }

  try {
    const media = await prisma.media.create({
      data: { dataUrl: raw },
      select: { id: true },
    });
    return NextResponse.json({
      ok: true,
      url: `/api/media/${media.id}`,
      id: media.id,
    });
  } catch {
    return NextResponse.json({ error: "Could not store image." }, { status: 500 });
  }
}