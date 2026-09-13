import { HeroVideo } from "@/components/home/hero-video";
import { Marquee } from "@/components/home/marquee";
import { WatchFamily } from "@/components/home/watch-family";
import { HouseDetails } from "@/components/home/house-details";
import { NewWatchesBand } from "@/components/home/new-watches-band";
import { WatchmakingBand } from "@/components/home/watchmaking-band";
import { FeaturedCategories } from "@/components/home/categories";
import { Testimonials } from "@/components/home/testimonials";
import { Benefits } from "@/components/home/benefits";
import { WatchFinderCTA } from "@/components/home/watch-finder-cta";
import { NewsletterBanner } from "@/components/home/newsletter-banner";
import { SectionHeader } from "@/components/home/section-header";
import { ProductRail } from "@/components/product/product-rail";
import { Reveal } from "@/components/ui/reveal";
import { getHomeProducts } from "@/lib/data";

export const revalidate = 300;

export default async function HomePage() {
  const { newArrivals, bestSellers, categories } = await getHomeProducts();

  return (
    <>
      <HeroVideo />

      <Marquee />

      <WatchFamily products={bestSellers.slice(0, 4)} />

      <section className="bg-white">
        <div className="container-tc py-16 lg:py-24">
          <SectionHeader
            eyebrow="Customer Favourites"
            title="Best Sellers"
            subtitle="The watches everyone can't stop talking about."
            href="/watches?sort=bestselling"
          />
          <Reveal className="mt-10">
            <ProductRail products={bestSellers.slice(0, 8)} columns={4} />
          </Reveal>
        </div>
      </section>

      <HouseDetails />

      <NewWatchesBand products={newArrivals} />

      <WatchmakingBand />

      <FeaturedCategories categories={categories} />

      <section className="border-t border-soft-gray bg-white">
        <div className="container-tc py-16 lg:py-24">
          <SectionHeader
            eyebrow="Step into the world of Time Cart"
            title="Partners in Time"
            subtitle="From everyday classics to statement pieces, every watch is chosen with care."
          />
          <Reveal className="mt-10">
            <div className="grid gap-px overflow-hidden bg-soft-gray sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 4).map((c) => (
                <div key={c.id} className="bg-white p-8 text-center">
                  <p className="text-xs font-light uppercase tracking-[0.3em] text-champagne">
                    {c.productCount} models
                  </p>
                  <p className="mt-3 font-heading text-xl font-light uppercase tracking-wide text-obsidian">
                    {c.name}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Testimonials />

      <Benefits />

      <WatchFinderCTA />

      <NewsletterBanner />
    </>
  );
}