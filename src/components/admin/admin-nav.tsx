"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Tags,
  ShoppingCart,
  TicketPercent,
  Star,
  Users,
  FileText,
  Inbox,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminLogoutAction } from "@/app/admin/login/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/brands", label: "Brands", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/contact-submissions", label: "Inquiries", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-4 py-5">
      <p className="px-2 pb-3 text-[9px] font-light uppercase tracking-[0.4em] text-ivory/30">
        Menu
      </p>
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 border-l border-transparent px-2 py-2.5 text-[10px] font-light uppercase tracking-[0.22em] transition-colors",
              active
                ? "border-champagne bg-ivory/[0.06] text-champagne"
                : "text-ivory/45 hover:bg-ivory/[0.04] hover:text-ivory"
            )}
          >
            <item.icon
              className={cn("h-4 w-4", active ? "text-champagne" : "text-ivory/40")}
              strokeWidth={1.5}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminTopBar({ username = "Admin" }: { username?: string }) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <header className="flex h-16 items-center justify-between border-b border-ivory/10 bg-obsidian px-6 text-ivory">
      <p className="text-[10px] font-light uppercase tracking-[0.3em] text-ivory/55">
        Administration
        <span className="mx-2 text-ivory/20">·</span>
        <Link
          href="/"
          className="text-champagne transition-colors hover:text-ivory"
        >
          View Storefront
        </Link>
      </p>
      <div className="flex items-center gap-4">
        <span className="hidden items-center gap-2 border border-emerald-400/30 px-3 py-1 text-[10px] font-light uppercase tracking-[0.25em] text-emerald-300 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Store Live
        </span>
        <span className="text-[10px] font-light uppercase tracking-[0.25em] text-ivory/40">
          {username}
        </span>
        <div className="flex h-9 w-9 items-center justify-center border border-champagne/40 text-xs font-medium text-champagne">
          {initials}
        </div>
        <form action={adminLogoutAction}>
          <button
            type="submit"
            title="Sign out"
            className="flex h-9 items-center gap-2 text-[10px] font-light uppercase tracking-[0.25em] text-ivory/60 transition-colors hover:text-champagne"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}