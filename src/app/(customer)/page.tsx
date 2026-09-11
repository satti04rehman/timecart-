import { ScrollVideoSection } from "@/components/home/scroll-video-section";
import { Benefits } from "@/components/home/benefits";
import { ShopByBrands } from "@/components/home/shop-by-brands";
import { FeaturedCategories } from "@/components/home/categories";
import { CollectionCards } from "@/components/home/collection-cards";
import { WatchFinderCTA } from "@/components/home/watch-finder-cta";
import { PromoBanner } from "@/components/home/promo-banner";
import { InspireStrip } from "@/components/home/inspire-strip";
import { Testimonials } from "@/components/home/testimonials";
import { NewsletterBanner } from "@/components/home/newsletter-banner";
import { SectionHeader } from "@/components/home/section-header";
import { Marquee } from "@/components/home/marquee";
import { ProductRail } from "@/components/product/product-rail";
import { Reveal } from "@/components/ui/reveal";
import { getBrandCounts, getHomeProducts } from "@/lib/data";

export const revalidate = 300;

export default async function HomePage() {
  const { newArrivals, bestSellers, categories, brands } =
    await getHomeProducts();
  const brandCounts = await getBrandCounts();

  return (
    <>
      <ScrollVideoSection />

      <Marquee />

      <Benefits />

      <ShopByBrands brands={brands} counts={brandCounts} />

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

      <FeaturedCategories categories={categories} />

      <CollectionCards categories={categories} />

      <section className="border-t border-soft-gray">
        <div className="container-tc py-16 lg:py-24">
          <SectionHeader
            eyebrow="Fresh In"
            title="New Arrivals"
            subtitle="Just landed on the TimeCart watch desk."
            href="/watches?sort=newest"
          />
          <Reveal className="mt-10">
            <ProductRail products={newArrivals.slice(0, 8)} columns={4} />
          </Reveal>
        </div>
      </section>

      <PromoBanner />

      <WatchFinderCTA />

      <Testimonials />

      <InspireStrip />

      <NewsletterBanner />
    </>
  );
}