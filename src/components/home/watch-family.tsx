import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { resolveProductImage } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types";

/**
 * Rolex-style editorial band: alternating full-width image + minimal text rows,
 * each with a model name, one-line descriptor and a "Discover more" link.
 */
export function WatchFamily({ products }: { products: ProductSummary[] }) {
  return (
    <section className="bg-ivory" id="collection">
      <div className="container-tc py-16 lg:py-28">
        <Reveal>
          <p className="text-center text-xs font-light uppercase tracking-[0.45em] text-champagne">
            The Time Cart family
          </p>
          <h2 className="mt-5 text-center font-heading text-3xl font-extralight uppercase tracking-[0.05em] text-obsidian lg:text-5xl">
            Featured Watches
          </h2>
        </Reveal>

        <div className="mt-14 space-y-16 lg:mt-20 lg:space-y-24">
          {products.map((product, i) => {
            const reversed = i % 2 === 1;
            const tagline = `${product.movement ?? "Precision"} \u00b7 ${product.category.name}`;
            return (
              <Reveal key={product.id} delay={i * 80}>
                <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
                  {/* Image */}
                  <div
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden bg-soft-gray/40 lg:col-span-7",
                      reversed && "lg:order-last"
                    )}
                  >
                    {product.imageUrl ? (
                      <Link href={`/watches/${product.slug}`} aria-label={product.name}>
                        <Image
                          src={resolveProductImage(product.imageUrl)}
                          alt={product.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 58vw"
                          className="object-cover transition-transform duration-700 hover:scale-105"
                        />
                      </Link>
                    ) : null}
                  </div>

                  {/* Text */}
                  <div className="lg:col-span-5">
                    <p className="text-xs font-light uppercase tracking-[0.4em] text-champagne">
                      {product.brand.name}
                    </p>
                    <Link href={`/watches/${product.slug}`} className="group block">
                      <h3 className="mt-4 font-heading text-3xl font-extralight uppercase tracking-[0.04em] text-obsidian transition-colors group-hover:text-champagne lg:text-5xl">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="mt-4 max-w-md text-sm font-light leading-relaxed tracking-wide text-text-gray">
                      {tagline}
                    </p>
                    <p className="mt-5 font-heading text-lg font-light tracking-wide text-obsidian">
                      {formatPrice(product.salePrice)}
                    </p>
                    <Link
                      href={`/watches/${product.slug}`}
                      className="group mt-7 inline-flex min-h-11 items-center gap-3 py-2 text-xs font-medium uppercase tracking-[0.35em] text-obsidian transition-colors hover:text-champagne"
                    >
                      Discover more
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}