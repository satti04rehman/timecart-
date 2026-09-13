"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { resolveProductImage } from "@/lib/product-images";

export function CartPage() {
  const router = useRouter();
  const { cart, cartSubtotal, updateQuantity, removeFromCart } = useStore();

  if (cart.length === 0) {
    return (
      <div className="container-tc flex flex-col items-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-soft-gray">
          <ShoppingBag className="h-7 w-7 text-text-gray" />
        </div>
        <h1 className="mt-6 font-heading text-2xl text-obsidian">
          Your bag is empty
        </h1>
        <p className="mt-2 max-w-sm text-sm text-text-gray">
          Looks like you haven't added any watches yet. Explore our collection
          and find your next timepiece.
        </p>
        <Button asChild className="mt-8">
          <Link href="/watches">Shop Watches</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-tc py-10 lg:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">
        Your Selection
      </p>
      <h1 className="mt-2 font-heading text-3xl lg:text-4xl">Shopping Bag</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.key}
              className="flex gap-4 rounded-xl border border-soft-gray bg-white p-4"
            >
              <Link
                href={`/watches/${item.productSlug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-soft-gray/50"
              >
                {item.imageUrl ? (
                  <Image
                    src={resolveProductImage(item.imageUrl)}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : null}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-champagne">
                      {item.brand}
                    </p>
                    <Link
                      href={`/watches/${item.productSlug}`}
                      className="mt-0.5 line-clamp-1 font-medium text-obsidian hover:text-champagne"
                    >
                      {item.name}
                    </Link>
                    {item.color && (
                      <p className="mt-0.5 text-xs text-text-gray">
                        {item.color}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.key)}
                    className="text-text-gray transition-colors hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-soft-gray">
                    <button
                      onClick={() =>
                        updateQuantity(item.key, item.quantity - 1)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-full text-obsidian hover:bg-soft-gray/50"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.key, item.quantity + 1)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-full text-obsidian hover:bg-soft-gray/50"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="font-semibold text-obsidian">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/watches"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-champagne hover:underline"
          >
            Continue shopping <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-xl border border-soft-gray bg-white p-6 lg:sticky lg:top-24">
          <h2 className="font-heading text-lg text-obsidian">Order Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between text-text-gray">
              <span>Subtotal ({cart.length} item{cart.length === 1 ? "" : "s"})</span>
              <span className="font-medium text-obsidian">
                {formatPrice(cartSubtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-text-gray">
              <span>Shipping</span>
              <span className="font-medium text-emerald-700">Free</span>
            </div>
            <div className="flex items-center justify-between text-text-gray">
              <span>Delivery</span>
              <span>3–5 days</span>
            </div>
          </div>

          <div className="my-5 h-px bg-soft-gray" />

          <div className="flex items-center justify-between">
            <span className="font-medium text-obsidian">Total</span>
            <span className="font-heading text-2xl text-obsidian">
              {formatPrice(cartSubtotal)}
            </span>
          </div>

          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={() => router.push("/checkout")}
          >
            Checkout <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <p className="mt-3 text-center text-xs text-text-gray">
            Cash on Delivery & bank transfer available at checkout.
          </p>
        </aside>
      </div>
    </div>
  );
}