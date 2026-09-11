import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/home/section-header";
import { Reveal } from "@/components/ui/reveal";

export function PromoBanner() {
  return (
    <section className="container-tc py-16 lg:py-20">
      <Reveal from="scale">
        <div className="relative overflow-hidden rounded-xl bg-obsidian px-8 py-14 text-center text-ivory sm:px-14">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-champagne/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-champagne/10 blur-3xl" />
          <SectionHeader
            align="center"
            eyebrow="Limited Time"
            title="Up to 30% OFF Selected Watches"
            dark
          />
          <p className="mx-auto mt-4 max-w-md text-ivory/70">
            A timeless classic, now at a special price.
          </p>
          <div className="mt-8">
            <Button asChild variant="champagne" size="lg">
              <Link href="/watches?onSale=1">Shop the Sale</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}