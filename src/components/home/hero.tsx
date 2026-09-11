import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-obsidian text-ivory">
      <div className="grid min-h-[82vh] lg:grid-cols-2">
        {/* Text */}
        <div className="flex items-center px-5 py-20 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-xl lg:mx-0">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-champagne">
              TIME CART
            </p>
            <h1 className="mt-5 font-heading text-[44px] leading-[1.05] sm:text-6xl lg:text-7xl">
              Timeless Style.
              <br />
              <span className="italic text-champagne">Modern Choice.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ivory/70">
              Discover watches designed for every moment — authentic, elegant
              and delivered to your doorstep.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild variant="champagne" size="lg">
                <Link href="/watches">
                  Shop Watches <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="dark" size="lg">
                <Link href="/watches?sort=newest">Explore New Arrivals</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="relative hidden min-h-[70vh] lg:block">
          <Image
            src="https://picsum.photos/seed/tchero/1200/1400"
            alt="A premium timepiece"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/70 to-transparent" />
        </div>
      </div>
    </section>
  );
}