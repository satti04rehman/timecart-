"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Home, Search, ShoppingBag, User } from "lucide-react";
import { useStore } from "@/providers/store-provider";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "#", icon: Search, search: true },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Account", href: "/account", icon: User },
];

export function MobileNav() {
  const { cartCount, openCartDrawer } = useStore();
  const router = useRouter();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-soft-gray bg-ivory/95 backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={(e) => {
              if (item.search) {
                e.preventDefault();
                router.push("/watches");
              }
            }}
            className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-text-gray transition-colors hover:text-obsidian"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={openCartDrawer}
          className="relative flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-text-gray transition-colors hover:text-obsidian"
        >
          <span className="relative">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-obsidian px-1 text-[10px] font-bold text-ivory">
                {cartCount}
              </span>
            )}
          </span>
          Cart
        </button>
      </div>
    </nav>
  );
}