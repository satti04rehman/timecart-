import { WatchFinder } from "@/components/finder/watch-finder";

export default function FindWatchPage() {
  return (
    <div className="container-tc py-10 lg:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">
          Watch Finder
        </p>
        <h1 className="mt-3 font-heading text-3xl text-obsidian lg:text-4xl">
          Find Your Perfect Watch
        </h1>
        <p className="mt-3 text-sm text-text-gray lg:text-base">
          Answer five quick questions and we'll match you with timepieces that
          suit your style, budget and lifestyle.
        </p>
      </div>

      <div className="mt-12">
        <WatchFinder />
      </div>
    </div>
  );
}