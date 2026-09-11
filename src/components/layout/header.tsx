"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/store-provider";
import { SearchOverlay } from "@/components/search/search-overlay";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Watches", href: "/watches" },
  { label: "Men", href: "/watches?gender=MEN" },
  { label: "Women", href: "/watches?gender=WOMEN" },
  { label: "Brands", href: "/watches" },
  { label: "New Arrivals", href: "/watches?sort=newest" },
  { label: "Sale", href: "/watches?onSale=1", sale: true },
];

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { cartCount, openCartDrawer, wishlist } = useStore();
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 bg-ivory/95 backdrop-blur-md",
          scrolled
            ? "border-b border-soft-gray shadow-sm shadow-obsidian/5"
            : "border-b border-transparent"
        )}
      >
        <div className="container-tc">
          <div className="flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
            {/* Mobile menu button */}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md text-obsidian hover:bg-soft-gray/60 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="shrink-0" aria-label="TimeCart home">
              <Logo />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-7 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium tracking-wide transition-colors hover:text-champagne",
                    link.sale ? "text-champagne" : "text-obsidian",
                    pathname === link.href && "text-champagne"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="hidden rounded-full sm:inline-flex"
                aria-label="Account"
              >
                <Link href="/account">
                  <User className="h-[18px] w-[18px]" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative hidden rounded-full sm:inline-flex"
                aria-label="Wishlist"
              >
                <Link href="/wishlist">
                  <Heart className="h-[18px] w-[18px]" />
                  {wishlist.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 text-[10px] font-bold text-obsidian">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full"
                onClick={openCartDrawer}
                aria-label="Cart"
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-obsidian px-1 text-[10px] font-bold text-ivory">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-[max-height] duration-300",
            mobileOpen ? "max-h-[70vh]" : "max-h-0"
          )}
        >
          <nav className="container-tc flex flex-col gap-1 border-t border-soft-gray py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-3 text-[15px] font-medium text-obsidian transition-colors hover:bg-soft-gray/60",
                  link.sale && "text-champagne"
                )}
              >
                {link.label}
                {link.sale && (
                  <span className="rounded-full bg-champagne/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-champagne">
                    Sale
                  </span>
                )}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-soft-gray pt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/account">
                  <User className="h-4 w-4" /> My Account
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/wishlist">
                  <Heart className="h-4 w-4" /> Wishlist
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}