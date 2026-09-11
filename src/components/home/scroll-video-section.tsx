import { ScrollScrubVideo } from "@/components/video/scroll-scrub-video";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ScrollVideoSection() {
  return (
    <ScrollScrubVideo
      src="/videos/animatio-30fps.mp4"
      mobileSrc="/videos/animatio-mobile.mp4"
      poster="/images/video-poster.jpg"
      fps={30}
      hint="Scroll to explore"
      className="h-[200vh]"
    >
      <div className="pointer-events-auto flex h-full w-full max-w-4xl items-center justify-center px-6 text-center text-ivory">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-champagne">
            Time Cart &mdash; Est. Collection
          </p>
          <h1 className="mt-6 font-heading text-5xl leading-[1.05] sm:text-7xl lg:text-8xl">
            Timeless Style.
            <br />
            <span className="italic text-champagne">Modern Choice.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-ivory/80 sm:text-lg">
            Discover watches designed for every moment &mdash; authentic,
            elegant, and delivered to your doorstep.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="champagne" size="lg">
              <Link href="/watches">
                Shop Watches <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="dark" size="lg">
              <Link href="/find-watch">Find Your Watch</Link>
            </Button>
          </div>
        </div>
      </div>
    </ScrollScrubVideo>
  );
}