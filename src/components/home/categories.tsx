import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/home/section-header";
import { Reveal } from "@/components/ui/reveal";

interface FeatureCategoriesProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  }[];
}

export function FeaturedCategories({ categories }: FeatureCategoriesProps) {
  const featured = categories.slice(0, 8);
  if (featured.length === 0) return null;

  return (
    <section className="container-tc py-16 lg:py-24">
      <SectionHeader
        eyebrow="Collections"
        title="Shop by Category"
        subtitle="Explore curated collections, designed around the way you live."
        href="/watches"
        linkLabel="View all"
      />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {featured.map((category, i) => (
          <Reveal key={category.id} delay={(i % 4) * 70} duration={700}>
            <Link
              href={`/watches?category=${category.slug}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-lg bg-soft-gray"
            >
              {category.imageUrl && (
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  loading="lazy"
                  sizes="(min-width:1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-obsidian/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-heading text-xl text-ivory">
                  {category.name.replace(" Watches", "")}
                </h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-champagne">
                  Explore
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}