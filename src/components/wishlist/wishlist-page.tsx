"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { ProductSummary } from "@/types";
import { cn } from "@/lib/utils";

export function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [products, setProducts] = React.useState<ProductSummary[] | null>(null);

  React.useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/products?ids=${encodeURIComponent(wishlist.join(","))}`)
      .then((r) => r.json())
      .then((data: { products: ProductSummary[] }) => {
        if (!cancelled) setProducts(data.products);
      })
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, [wishlist]);

  if (wishlist.length === 0) {
    return (
      <div className="container-tc flex flex-col items-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-soft-gray">
          <Heart className="h-7 w-7 text-text-gray" />
        </div>
        <h1 className="mt-6 font-heading text-2xl text-obsidian">
          Your wishlist is empty
        </h1>
        <p className="mt-2 max-w-sm text-sm text-text-gray">
          Tap the heart on any watch to save it here for later.
        </p>
        <Button asChild className="mt-8">
          <Link href="/watches">Browse Watches</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-tc py-10 lg:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">
        Saved for Later
      </p>
      <h1 className="mt-2 font-heading text-3xl lg:text-4xl">My Wishlist</h1>
      <p className="mt-2 text-sm text-text-gray">
        {wishlist.length} watch{wishlist.length === 1 ? "" : "es"} in your
        wishlist
      </p>

      {products === null ? (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-xl bg-soft-gray/60"
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="group relative rounded-xl border border-soft-gray bg-white p-3 transition-shadow hover:shadow-lg"
            >
              <Link
                href={`/watches/${p.slug}`}
                className="relative block aspect-square overflow-hidden rounded-lg bg-soft-gray/50"
              >
                {p.imageUrl && (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
              </Link>
              <div className="mt-3 px-1 pb-1">
                <p className="text-[11px] uppercase tracking-wider text-champagne">
                  {p.brand.name}
                </p>
                <Link
                  href={`/watches/${p.slug}`}
                  className="mt-0.5 line-clamp-2 text-sm font-medium text-obsidian hover:text-champagne"
                >
                  {p.name}
                </Link>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-obsidian">
                    {formatPrice(p.salePrice)}
                  </span>
                  {p.discount > 0 && (
                    <span className="text-xs text-text-gray line-through">
                      {formatPrice(p.price)}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    className={cn("flex-1 gap-1", p.stock <= 0 && "opacity-50")}
                    disabled={p.stock <= 0}
                    onClick={() =>
                      addToCart({
                        key: `${p.id}`,
                        productId: p.id,
                        productSlug: p.slug,
                        name: p.name,
                        brand: p.brand.name,
                        imageUrl: p.imageUrl,
                        unitPrice: p.salePrice,
                        quantity: 1,
                        maxStock: p.stock,
                      })
                    }
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> Add
                  </Button>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="rounded-md border border-soft-gray p-2 text-text-gray transition-colors hover:border-red-300 hover:text-red-600"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {p.discount > 0 && (
                  <Badge
                    variant="sale"
                    className="absolute left-4 top-4 z-10"
                  >
                    {Math.round(p.discount)}% OFF
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}