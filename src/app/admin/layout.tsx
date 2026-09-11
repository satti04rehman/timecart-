import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AdminNav, AdminTopBar } from "@/components/admin/admin-nav";
import { getAdminSession } from "@/lib/admin-actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Not signed in → render login (or any exposed page) full-screen.
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-obsidian text-ivory">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ivory/10 lg:flex">
        <div className="flex h-16 items-center border-b border-ivory/10 px-5">
          <Link href="/admin">
            <Logo variant="light" className="h-6" />
          </Link>
        </div>
        <AdminNav />
        <div className="border-t border-ivory/10 p-4 text-[11px] text-ivory/40">
          TimeCart Admin
          <br />
          v1.0 · Demo build
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar username={session.username} />
        <main className="overflow-x-hidden bg-obsidian px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}