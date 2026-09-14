"use client";

import * as React from "react";
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
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
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

function isActive(pathname: string, item: (typeof NAV)[number]) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {NAV.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
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
    </>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-4 py-5">
      <p className="px-2 pb-3 text-[9px] font-light uppercase tracking-[0.4em] text-ivory/30">
        Menu
      </p>
      <NavLinks />
    </nav>
  );
}

export function AdminMobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const close = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-ivory/15 text-ivory transition-colors hover:bg-ivory/10 lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-[70] bg-obsidian/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[80] flex w-[75vw] max-w-xs flex-col bg-obsidian text-ivory shadow-2xl transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
        aria-label="Admin navigation"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-ivory/10 px-5">
          <Link href="/admin" onClick={close}>
            <Logo variant="light" className="h-6" />
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-md text-ivory/70 transition-colors hover:bg-ivory/10 hover:text-ivory"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-4 py-5">
          <p className="px-2 pb-3 text-[9px] font-light uppercase tracking-[0.4em] text-ivory/30">
            Menu
          </p>
          <NavLinks onNavigate={close} />
        </nav>
        <div className="border-t border-ivory/10 p-5 text-[10px] font-light uppercase tracking-[0.3em] text-ivory/35">
          TimeCart Admin
          <br />
          <span className="text-ivory/25">v1.0</span>
        </div>
      </aside>
    </>
  );
}

export function AdminTopBar({ username = "Admin" }: { username?: string }) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-ivory/10 bg-obsidian px-4 text-ivory sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <AdminMobileNav />
        <p className="truncate text-[10px] font-light uppercase tracking-[0.3em] text-ivory/55">
          <span className="hidden sm:inline">
            Administration
            <span className="mx-2 text-ivory/20">·</span>
          </span>
          <Link
            href="/"
            className="text-champagne transition-colors hover:text-ivory"
          >
            View Storefront
          </Link>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <span className="hidden items-center gap-2 border border-emerald-400/30 px-3 py-1 text-[10px] font-light uppercase tracking-[0.25em] text-emerald-300 md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Store Live
        </span>
        <span className="hidden text-[10px] font-light uppercase tracking-[0.25em] text-ivory/40 md:inline">
          {username}
        </span>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-champagne/40 text-xs font-medium text-champagne">
          {initials}
        </div>
        <form action={adminLogoutAction}>
          <button
            type="submit"
            title="Sign out"
            className="flex h-9 items-center gap-2 text-[10px] font-light uppercase tracking-[0.25em] text-ivory/60 transition-colors hover:text-champagne"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}