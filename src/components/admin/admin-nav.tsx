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
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-champagne/20 text-champagne"
                : "text-ivory/60 hover:bg-ivory/5 hover:text-ivory"
            )}
          >
            <item.icon className="h-4 w-4" />
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
    <header className="flex h-16 items-center justify-between border-b border-ivory/10 px-6">
      <p className="text-sm text-ivory/50">
        Admin Panel{" "}
        <span className="mx-2 text-ivory/20">·</span>
        <Link
          href="/"
          className="text-champagne transition-colors hover:text-ivory"
        >
          View Storefront
        </Link>
      </p>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Store Live
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-champagne text-xs font-bold text-obsidian">
          {initials}
        </div>
        <form action={adminLogoutAction}>
          <button
            type="submit"
            title="Sign out"
            className="flex h-9 items-center gap-2 rounded-lg border border-ivory/15 px-3 text-xs font-medium text-ivory/70 transition-colors hover:border-champagne/50 hover:text-champagne"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}