"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { useStore } from "@/providers/store-provider";
import { formatPrice } from "@/lib/utils";
import { resolveProductImage } from "@/lib/product-images";
import type { ProductSummary } from "@/types";
import { toast } from "sonner";

export function QuickViewDialog({
  product,
  onClose,
}: {
  product: ProductSummary | null;
  onClose: () => void;
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  if (!product) return null;
  const wished = isWishlisted(product.id);

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="grid sm:grid-cols-2">
          <div className="relative aspect-square bg-white">
            <DialogTitle className="sr-only">{product.name}</DialogTitle>
            {product.imageUrl && (
              <Image
                src={resolveProductImage(product.imageUrl)}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 384px"
                className="object-cover"
              />
            )}
            {product.discount > 0 && (
              <Badge variant="sale" className="absolute left-4 top-4">
                {Math.round(product.discount)}% OFF
              </Badge>
            )}
          </div>
          <div className="flex flex-col p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">
              {product.brand.name}
            </p>
            <h3 className="mt-2 font-heading text-2xl text-obsidian">
              {product.name}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <Rating value={product.ratingAvg} size="sm" showValue />
              <span className="text-xs text-text-gray">
                ({product.ratingCount} reviews)
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              {product.discount > 0 ? (
                <>
                  <span className="text-2xl font-semibold text-obsidian">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-base text-text-gray line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-semibold text-obsidian">
                  {formatPrice(product.salePrice)}
                </span>
              )}
            </div>

            <p
              className={
                product.stock > 0
                  ? "mt-1 text-sm font-medium text-emerald-600"
                  : "mt-1 text-sm font-medium text-red-600"
              }
            >
              {product.stock > 0 ? "In Stock" : "Sold Out"}
            </p>

            <div className="mt-4 flex flex-col gap-2.5">
              <Button
                size="lg"
                disabled={product.stock <= 0}
                onClick={() => {
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
                }}
              >
                Add to Cart
              </Button>
              <div className="grid grid-cols-2 gap-2.5">
                <Button asChild variant="outline">
                  <Link href={`/watches/${product.slug}`} onClick={onClose}>
                    View Details
                  </Link>
                </Button>
                <Button
                  variant={wished ? "champagne" : "outline"}
                  onClick={() => {
                    toggleWishlist(product.id);
                    toast.success(
                      wished ? "Removed from wishlist" : "Saved to wishlist"
                    );
                  }}
                >
                  <Heart className="h-4 w-4" />
                  {wished ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}