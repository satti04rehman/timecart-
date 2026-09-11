import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/home/section-header";
import { Reveal } from "@/components/ui/reveal";

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CollectionCards({
  categories,
}: {
  categories: { id: string; name: string; slug: string; imageUrl: string | null }[];
}) {
  const pick = (slug: string) =>
    categories.find((c) => c.slug === slug) ?? null;

  const trio = [
    pick("dress") ?? pick("luxury"),
    pick("automatic"),
    pick("sport"),
  ].filter((c): c is NonNullable<typeof c> => c !== null);

  if (trio.length === 0) {
    return (
      <section className="bg-white py-16 lg:py-24">
        <div className="container-tc">
          <SectionHeader align="center" eyebrow="Curated" title="Season Collection" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container-tc">
        <SectionHeader
          eyebrow="Curated for Now"
          title="Season Collection"
          subtitle="Three moods. One wardrobe. Explore the drops of the season."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {trio.map((c, i) => (
          <Reveal key={c.id} delay={i * 120} duration={700}>
            <Link
              href={`/watches?category=${c.slug}`}
              className="group relative block h-[440px] overflow-hidden rounded-xl bg-obsidian"
            >
              <Image
                src={
                  c.imageUrl ??
                  `https://picsum.photos/seed/season-${c.slug}/900/1200`
                }
                alt={c.name}
                fill
                loading="lazy"
                sizes="(min-width:1024px) 33vw, 50vw"
                className="object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-champagne">
                  The Season
                </p>
                <h3 className="mt-2 font-heading text-3xl text-ivory">
                  {c.name.replace("Watches", "").trim() || c.name}
                </h3>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ivory/85">
                  Shop the collection
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
        </div>
      </div>
    </section>
  );
}