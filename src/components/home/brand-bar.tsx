import { SectionHeader } from "@/components/home/section-header";
import type { BrandSummary } from "@/types";

export function BrandBar({ brands }: { brands: BrandSummary[] }) {
  const visible = brands.filter((b) => b.logoUrl !== null);
  // If no logos available, show names in a typographic lockup instead
  const showNames = visible.length < 3;

  return (
    <section className="border-y border-soft-gray bg-white py-14">
      <div className="container-tc">
        <SectionHeader
          align="center"
          eyebrow="Trusted Brands"
          title="Shop by Brand"
        />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 lg:gap-x-16">
          {brands.map((brand) =>
            showNames || !brand.logoUrl ? (
              <span
                key={brand.id}
                className="font-heading text-xl uppercase tracking-[0.25em] text-obsidian/70 transition-colors hover:text-obsidian lg:text-2xl"
              >
                {brand.name}
              </span>
            ) : (
              <img
                key={brand.id}
                src={brand.logoUrl}
                alt={brand.name}
                className="h-8 object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}