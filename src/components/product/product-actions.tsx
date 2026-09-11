"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/store-provider";
import { cn, formatPrice } from "@/lib/utils";
import type { ProductDetail } from "@/types";

export function ProductActions({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);
  const wished = isWishlisted(product.id);

  const unitPrice = product.salePrice;
  const stock = product.stock;
  const outOfStock = stock <= 0;

  const handleAdd = () => {
    addToCart({
      key: `${product.id}`,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      brand: product.brand.name,
      imageUrl: product.imageUrl,
      unitPrice,
      quantity: qty,
      maxStock: stock,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addToCart({
      key: `${product.id}`,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      brand: product.brand.name,
      imageUrl: product.imageUrl,
      unitPrice,
      quantity: qty,
      maxStock: stock,
    });
    router.push("/checkout");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-soft-gray bg-white">
          <button
            onClick={() => setQty((v) => Math.max(1, v - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full text-obsidian transition-colors hover:bg-soft-gray/50"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{qty}</span>
          <button
            onClick={() => setQty((v) => Math.min(stock, v + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full text-obsidian transition-colors hover:bg-soft-gray/50"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => toggleWishlist(product.id)}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
            wished
              ? "border-champagne bg-champagne/10 text-champagne"
              : "border-soft-gray bg-white text-obsidian hover:border-champagne hover:text-champagne"
          )}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4.5 w-4.5", wished && "fill-champagne")} />
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="flex-1 gap-2"
          onClick={handleAdd}
          disabled={outOfStock}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" /> Added to Bag
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Add to Bag
            </>
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleBuyNow}
          disabled={outOfStock}
        >
          <Zap className="h-4 w-4 text-champagne" /> Buy Now
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-gray">
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
              outOfStock ? "bg-red-400" : "bg-green-500"
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              outOfStock ? "bg-red-500" : "bg-green-600"
            )}
          />
        </span>
        {outOfStock
          ? "Out of stock"
          : stock <= 5
            ? `Only ${stock} left in stock`
            : "In stock"}
      </div>
    </div>
  );
}