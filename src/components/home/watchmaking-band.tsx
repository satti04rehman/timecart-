import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

/**
 * Full-bleed cinematic band (Rolex "Watchmaking" style): dark imagery with a
 * small centered editorial block and an underline link.
 */
export function WatchmakingBand() {
  return (
    <section className="relative flex min-h-[72vh] items-center justify-center overflow-hidden bg-obsidian">
      <div className="absolute inset-0">
        <Image
          src="https://picsum.photos/seed/tcwatchmaking/1920/1200"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/60 via-obsidian/30 to-obsidian/80" />
      </div>

      <div className="relative z-10 px-6 text-center text-ivory">
        <Reveal>
          <p className="text-xs font-light uppercase tracking-[0.5em] text-champagne">
            Craftsmanship
          </p>
          <h2 className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-extralight uppercase leading-[1.1] tracking-[0.06em] sm:text-6xl lg:text-7xl">
            A Unique Approach
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm font-light leading-relaxed tracking-wide text-ivory/75 sm:text-base">
            Every timepiece in our collection is chosen for precision, durability
            and character &mdash; from classic quartz to automatic movements.
          </p>
          <Link
            href="/watches"
            className="group mt-10 inline-flex items-center gap-3 border-b border-ivory/50 pt-4 pb-3 text-xs font-medium uppercase tracking-[0.35em] text-ivory transition-colors hover:border-champagne hover:text-champagne"
          >
            Discover the collection
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}