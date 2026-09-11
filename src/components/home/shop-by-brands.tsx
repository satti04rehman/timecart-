import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { Reveal } from "@/components/ui/reveal";
import type { BrandSummary } from "@/types";

export function ShopByBrands({
  brands,
  counts,
}: {
  brands: BrandSummary[];
  counts: Record<string, number>;
}) {
  const featured = brands.slice(0, 8);
  if (featured.length === 0) return null;

  return (
    <section className="py-16 lg:py-24">
      <div className="container-tc">
        <SectionHeader
          align="center"
          eyebrow="The House of Time"
          title="Shop by Brands"
          subtitle="Authentic timepieces from the world's most trusted names."
          href="/watches"
          linkLabel="Shop all brands"
        />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {featured.map((brand, i) => {
            const img = brand.logoUrl
              ? brand.logoUrl
              : `https://picsum.photos/seed/brand-${brand.slug}/800/1000`;
            return (
              <Reveal
                key={brand.slug}
                delay={(i % 4) * 80}
                duration={700}
              >
                <Link
                  href={`/watches?brand=${brand.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-obsidian"
                >
                  <Image
                    src={img}
                    alt={brand.name}
                    fill
                    loading="lazy"
                    sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                    className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                    <div>
                      <h3 className="font-heading text-2xl text-ivory">
                        {brand.name}
                      </h3>
                      <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.2em] text-ivory/70">
                        {counts[brand.slug] ?? 0} watches
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-champagne text-obsidian opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}