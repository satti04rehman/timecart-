import { AccountNav } from "@/components/account/account-nav";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-tc py-10 lg:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">
        My TimeCart
      </p>
      <h1 className="mt-2 font-heading text-3xl text-obsidian">My Account</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-soft-gray bg-white p-3">
            <AccountNav />
          </div>
          <div className="mt-3 rounded-xl bg-soft-gray/50 p-4 text-xs text-text-gray">
            Connect Supabase to enable full accounts, order history synced
            across devices and email notifications.
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}