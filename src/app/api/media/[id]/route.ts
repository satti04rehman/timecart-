import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const media = await prisma.media.findUnique({
      where: { id },
      select: { dataUrl: true },
    });
    if (!media) return new NextResponse("Not found", { status: 404 });

    const comma = media.dataUrl.indexOf(",");
    const header = media.dataUrl.slice(0, comma);
    const base64 = media.dataUrl.slice(comma + 1);
    const mime = header.match(/^data:(image\/(png|jpeg|webp|gif));base64$/i)?.[1]?.toLowerCase();
    // Raster-only — never serve stored SVG as an executable document.
    if (!mime || !base64 || base64.length % 4 !== 0) {
      return new NextResponse("Not found", { status: 404 });
    }
    const bytes = Buffer.from(base64, "base64");
    if (bytes.length > 4 * 1024 * 1024) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=604800, immutable",
        "Content-Length": String(bytes.length),
        "Content-Security-Policy": "sandbox; default-src 'none'",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}