import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { prisma, getPrismaClient } from "@/lib/prisma";

export async function GET() {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ signedIn: false });
  }

  const client = getPrismaClient();
  if (!client) {
    return NextResponse.json({ signedIn: true, demo: true });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { isActive: true },
    });
    return NextResponse.json({
      signedIn: true,
      blocked: profile ? !profile.isActive : false,
    });
  } catch {
    return NextResponse.json({ signedIn: true });
  }
}