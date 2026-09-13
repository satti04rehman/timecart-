import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { resolveProductImage } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import type { ProductSummary } from "@/types";

/**
 * Black editorial band (Rolex "New watches 2026" style): uppercase headline,
 * underline link and a sparse grid of new arrivals.
 */
export function NewWatchesBand({ products }: { products: ProductSummary[] }) {
  return (
    <section className="bg-obsidian text-ivory">
      <div className="container-tc py-16 lg:py-24">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-light uppercase tracking-[0.45em] text-champagne">
                Featured &middot; {new Date().getFullYear()}
              </p>
              <h2 className="mt-4 font-heading text-3xl font-extralight uppercase tracking-[0.06em] sm:text-4xl lg:text-5xl">
                New Watches
              </h2>
            </div>
            <Link
              href="/watches?sort=newest"
              className="group inline-flex items-center gap-3 border-b border-ivory/50 pb-1 text-xs font-medium uppercase tracking-[0.35em] text-ivory transition-colors hover:border-champagne hover:text-champagne"
            >
              The Time Cart collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {products.slice(0, 4).map((product, i) => (
            <Reveal key={product.id} delay={i * 100}>
              <Link href={`/watches/${product.slug}`} className="group block">
                <div className="aspect-square overflow-hidden bg-ivory/5">
                  {product.imageUrl && (
                    <Image
                      src={resolveProductImage(product.imageUrl)}
                      alt={product.name}
                      width={640}
                      height={640}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-4 text-[11px] font-light uppercase tracking-[0.3em] text-ivory/50">
                  {product.brand.name}
                </p>
                <h3 className="mt-1.5 font-heading text-base font-light uppercase tracking-[0.04em] text-ivory transition-colors group-hover:text-champagne">
                  {product.name}
                </h3>
                <p className="mt-1.5 text-sm font-light text-ivory/70">
                  {formatPrice(product.salePrice)}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}