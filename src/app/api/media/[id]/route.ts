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
    if (!/^data:image\/[a-z0-9.+-]+;base64$/i.test(header)) {
      return new NextResponse("Not found", { status: 404 });
    }
    const contentType = header.replace(/^data:/, "").replace(/;base64$/, "");
    const bytes = Buffer.from(base64, "base64");

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
        "Content-Length": String(bytes.length),
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}