"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Eye, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/store-provider";
import { formatPrice } from "@/lib/utils";
import { resolveProductImage } from "@/lib/product-images";
import type { ProductSummary } from "@/types";
import { toast } from "sonner";

interface ProductCardProps {
  product: ProductSummary;
  onQuickView?: (product: ProductSummary) => void;
  priority?: boolean;
  variant?: "card" | "minimal";
}

export function ProductCard({
  product,
  onQuickView,
  priority = false,
  variant = "card",
}: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wished = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart({
      key: `${product.id}-default`,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      brand: product.brand.name,
      imageUrl: product.imageUrl,
      unitPrice: product.salePrice,
      quantity: 1,
      maxStock: product.stock,
    });
    toast.success("Added to cart");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast[wished ? "info" : "success"](
      wished ? "Removed from wishlist" : "Saved to wishlist"
    );
  };

  const salePercent =
    product.discount > 0
      ? Math.round((product.discount / (product.price || 1)) * 100)
      : 0;

  if (variant === "minimal") {
    const soldOut = product.stock <= 0;
    return (
      <Link
        href={`/watches/${product.slug}`}
        className="group block"
        aria-label={product.name}
      >
        <div className="relative aspect-square overflow-hidden bg-soft-gray/40">
          {product.imageUrl && (
            <Image
              src={resolveProductImage(product.imageUrl)}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (min-width: 1024px) 25vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              loading={priority ? undefined : "lazy"}
              priority={priority}
            />
          )}
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-ivory/70 backdrop-blur-sm">
              <span className="border border-obsidian/20 bg-ivory px-4 py-1.5 text-xs font-light uppercase tracking-[0.25em] text-obsidian">
                Sold Out
              </span>
            </div>
          )}
        </div>
        <p className="mt-5 text-xs font-light uppercase tracking-[0.3em] text-text-gray">
          {product.brand.name}
        </p>
        <h3 className="mt-1.5 font-heading text-lg font-light uppercase tracking-[0.04em] text-obsidian transition-colors group-hover:text-champagne">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-medium text-obsidian">
            {formatPrice(product.salePrice)}
          </span>
          {product.discount > 0 && (
            <span className="text-xs text-text-gray line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <span className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-obsidian/40 pb-1 pt-2 text-xs font-medium uppercase tracking-[0.3em] text-obsidian transition-colors group-hover:border-champagne group-hover:text-champagne">
          Discover more
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={`/watches/${product.slug}`}
        className="block"
        aria-label={product.name}
      >
        <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
          {product.imageUrl ? (
            <Image
              src={resolveProductImage(product.imageUrl)}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading={priority ? undefined : "lazy"}
              priority={priority}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-soft-gray/50 text-text-gray">
              TIME CART
            </div>
          )}

          {/* Top row badges/actions */}
          <div className="absolute inset-x-3 top-3 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {product.discount > 0 && (
                <Badge variant="sale">{Math.round(product.discount)}% OFF</Badge>
              )}
              {product.isNewArrival && (
                <Badge variant="champagne">New</Badge>
              )}
            </div>
            <button
              onClick={handleWishlist}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-ivory/90 shadow-sm backdrop-blur transition-all hover:scale-110"
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  wished ? "fill-obsidian text-obsidian" : "text-obsidian"
                }`}
              />
            </button>
          </div>

          {/* Hover quick view */}
          {onQuickView && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
              <Button
                variant="light"
                size="default"
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(product);
                }}
              >
                <Eye className="h-4 w-4" /> Quick View
              </Button>
            </div>
          )}

          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-ivory/70 backdrop-blur-sm">
              <span className="rounded-full border border-obsidian/20 bg-ivory px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 px-0.5 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-gray">
            {product.brand.name}
          </p>
          <h3 className="mt-1 truncate text-[15px] font-medium text-obsidian">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            {product.discount > 0 ? (
              <>
                <span className="text-sm font-semibold text-obsidian">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-xs text-text-gray line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-obsidian">
                {formatPrice(product.salePrice)}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <Rating value={product.ratingAvg} showValue />
            <span className="text-xs text-text-gray">
              ({product.ratingCount})
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}