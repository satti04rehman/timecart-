"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/store-provider";
import { formatPrice } from "@/lib/utils";
import { resolveProductImage } from "@/lib/product-images";

export function CartDrawer() {
  const {
    cart,
    cartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
  } = useStore();

  React.useEffect(() => {
    document.body.style.overflow = cartDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartDrawerOpen]);

  if (!cartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={closeCartDrawer}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivory shadow-2xl animate-in slide-in-from-right-full duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-soft-gray px-5 py-4">
          <h2 className="font-heading text-lg text-obsidian">
            Your Cart{" "}
            <span className="ml-1 text-sm text-text-gray">
              ({cart.length})
            </span>
          </h2>
          <button
            onClick={closeCartDrawer}
            className="rounded-full p-1.5 text-text-gray hover:bg-soft-gray hover:text-obsidian"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-soft-gray">
              <ShoppingBag className="h-7 w-7 text-text-gray" />
            </div>
            <p className="text-sm text-text-gray">
              Your cart is empty. Time to discover your next watch.
            </p>
            <Button
              variant="primary"
              size="sm"
              asChild
              onClick={closeCartDrawer}
            >
              <Link href="/watches">Browse Watches</Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-5">
              {cart.map((item) => (
                <div key={item.key} className="flex gap-4">
                  <Link
                    href={`/watches/${item.productSlug}`}
                    onClick={closeCartDrawer}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-soft-gray bg-white"
                  >
                    {item.imageUrl && (
                      <Image
                        src={resolveProductImage(item.imageUrl)}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-text-gray">
                          {item.brand}
                        </p>
                        <Link
                          href={`/watches/${item.productSlug}`}
                          onClick={closeCartDrawer}
                          className="line-clamp-1 text-sm font-medium text-obsidian hover:text-champagne"
                        >
                          {item.name}
                        </Link>
                        {item.variantName && (
                          <p className="text-xs text-text-gray">
                            {item.variantName}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="p-1 text-text-gray transition-colors hover:text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 rounded-full border border-soft-gray bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                          className="p-1.5 text-text-gray hover:text-obsidian"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                          className="p-1.5 text-text-gray hover:text-obsidian"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-obsidian">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-soft-gray px-5 py-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-text-gray">Subtotal</span>
              <span className="text-lg font-semibold text-obsidian">
                {formatPrice(cartSubtotal)}
              </span>
            </div>
            <p className="mb-4 text-xs text-text-gray">
              Shipping and discounts calculated at checkout.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" onClick={closeCartDrawer}>
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button asChild onClick={closeCartDrawer}>
                <Link href="/checkout">Checkout</Link>
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}