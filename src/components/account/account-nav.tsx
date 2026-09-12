"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Settings,
  Heart,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutCustomer } from "@/lib/session";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const onSignOut = async () => {
    setPending(true);
    await signOutCustomer();
    setPending(false);
    router.replace("/");
    router.refresh();
  };

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-obsidian text-ivory"
                : "text-text-gray hover:bg-soft-gray hover:text-obsidian"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}

      <div className="mt-2 border-t border-soft-gray pt-2">
        <button
          type="button"
          onClick={onSignOut}
          disabled={pending}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {pending ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </nav>
  );
}