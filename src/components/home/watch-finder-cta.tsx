import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function WatchFinderCTA() {
  return (
    <section className="container-tc py-16 lg:py-24">
      <Reveal from="up">
        <div className="relative overflow-hidden rounded-xl border border-soft-gray bg-white">
        <div className="mx-auto max-w-2xl px-6 py-14 text-center sm:py-20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-champagne/15">
            <Sparkles className="h-6 w-6 text-champagne" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.35em] text-champagne">
            Watch Finder
          </p>
          <h2 className="mt-4 font-heading text-3xl sm:text-5xl">
            Not sure which watch is{" "}
            <span className="italic text-champagne">right for you?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md leading-relaxed text-text-gray">
            Answer a few quick questions about your style and budget, and we'll
            find the perfect match.
          </p>
          <div className="mt-9">
            <Button asChild variant="primary" size="lg">
              <Link href="/find-watch">
                Find My Watch <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        </div>
      </Reveal>
    </section>
  );
}