import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Account deletion is not available right now." },
      { status: 503 }
    );
  }

  const adminRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
    method: "DELETE",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  const authDeleted = adminRes.ok || adminRes.status === 404;
  if (!authDeleted) {
    return NextResponse.json(
      { error: "We couldn't delete your account right now. Please try again later." },
      { status: 502 }
    );
  }

  // Best-effort cleanup of the profile/user rows created on signup
  // (prisma cascades addresses, orders, wishlists and reviews).
  try {
    await prisma.user.delete({ where: { id: user.id } });
  } catch {
    // Row may not exist (e.g. account created before the trigger) — fine.
  }

  // Invalidate Supabase session cookies (the deleted account's session).
  const store = await cookies();
  for (const cookie of store.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      store.set(cookie.name, "", { path: "/", maxAge: 0 });
    }
  }

  return NextResponse.json({ ok: true });
}