import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, getPrismaClient } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const uploadSchema = z.object({
  dataUrl: z.string().min(10),
});

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 4 * 1024 * 1024;

async function anyAuthenticatedAccount(): Promise<boolean> {
  try {
    const admin = await requireAdmin();
    if (!admin.response) return true;
    const supabase = await createSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const rl = rateLimit(req, "upload", 10, 60 * 1000);
  if (rl.limited) {
    return NextResponse.json(
      { error: "Too many uploads. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    );
  }

  if (!(await anyAuthenticatedAccount())) {
    return NextResponse.json(
      { error: "Sign in to upload images." },
      { status: 401 }
    );
  }

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

  // Strict raster-only allowlist — no SVG, no image/* catch-all.
  const mime = raw.match(/^data:(image\/(png|jpeg|webp|gif));base64,/i)?.[1]?.toLowerCase();
  if (!mime || !ALLOWED_TYPES[mime]) {
    return NextResponse.json(
      { error: "Unsupported format — please upload PNG, JPEG, WebP or GIF." },
      { status: 400 }
    );
  }
  const base64 = raw.split(",")[1] ?? "";
  if (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
    return NextResponse.json({ error: "Invalid image data." }, { status: 400 });
  }
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length > MAX_BYTES) {
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