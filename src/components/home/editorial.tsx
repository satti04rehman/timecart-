import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorialCollection() {
  return (
    <section className="container-tc py-16 lg:py-24">
      <div className="relative overflow-hidden rounded-xl bg-obsidian text-ivory">
        <div className="grid min-h-[420px] lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">
              Featured Collection
            </p>
            <h2 className="mt-4 font-heading text-3xl sm:text-5xl">
              The Everyday Collection
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ivory/70">
              Timepieces that move seamlessly from the boardroom to the
              countryside. Discreet. Reliable. Effortlessly elegant.
            </p>
            <div className="mt-8">
              <Button asChild variant="champagne" size="lg">
                <Link href="/watches?category=automatic">
                  Explore Collection <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative min-h-[280px] opacity-90">
            <Image
              src="/images/home/editorial.svg"
              alt="The Everyday Collection"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}