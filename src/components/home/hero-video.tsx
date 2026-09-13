"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowDown } from "lucide-react";
import type { ProductSummary } from "@/types";

const DESKTOP_SRC = "/videos/animatio-15fps.mp4?v4";
const MOBILE_SRC = "/videos/animatio-mobile-15fps.mp4?v4";
const HOLD_MS = 6000;
const MASK_IN = 500;
const SWAP_AT = 1200;

/**
 * Full-bleed cinematic hero: the campaign video plays continuously while a
 * black mask periodically fades in, the on-screen caption crossfades through
 * black to the next featured watch, then the mask fades out (Rolex-style
 * crossfade-through-black rhythm).
 */
export function HeroVideo({ products = [] }: { products?: ProductSummary[] }) {
  const [src, setSrc] = React.useState(DESKTOP_SRC);
  const [ready, setReady] = React.useState(false);
  const [masked, setMasked] = React.useState(true);
  const [maskMs, setMaskMs] = React.useState(1500);
  const [active, setActive] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);

  const slides: (null | ProductSummary)[] = [null, ...products];
  const len = slides.length;

  const fadeTo = React.useCallback((next: number) => {
    setMaskMs(MASK_IN);
    setMasked(true);
    window.setTimeout(() => {
      setActive(next);
      setMasked(false);
    }, SWAP_AT);
  }, []);

  const reveal = () => {
    setReady(true);
    window.setTimeout(() => setMasked(false), 300);
  };

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setSrc(mq.matches ? MOBILE_SRC : DESKTOP_SRC);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(rm.matches);
    if (rm.matches) setMasked(false);
  }, []);

  React.useEffect(() => {
    if (reduced || len <= 1) return;
    const id = window.setInterval(() => {
      fadeTo((active + 1) % len);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [active, len, reduced, fadeTo]);

  const activeProduct = slides[active];
  const isTagline = activeProduct === null;

  return (
    <section
      className="relative flex h-[85vh] w-full items-center justify-center overflow-hidden bg-obsidian lg:h-screen"
      aria-label="Time Cart cinematic hero"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster="/images/video-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={reveal}
        onPlaying={reveal}
        onError={reveal}
        aria-hidden="true"
      />

      {/* Black tint masking over the footage (always visible, like Rolex) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,3,3,0.72)_0%,rgba(3,3,3,0.45)_45%,rgba(3,3,3,0.55)_70%,rgba(3,3,3,0.85)_100%)]"
      />

      {/* Cinematic black mask (periodic crossfade-through-black) */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 bg-obsidian transition-opacity ease-out",
          masked ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${maskMs}ms` }}
      />

      {/* Caption layer */}
      <div
        className={cn(
          "relative z-10 px-6 text-center text-ivory transition-opacity ease-out",
          ready && !masked ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: "400ms" }}
        key={active}
      >
        {isTagline ? (
          <>
            <p className="text-xs font-light uppercase tracking-[0.5em] text-ivory/70">
              Time Cart &mdash; Where Time Meets Style
            </p>
            <h1 className="mx-auto mt-8 max-w-5xl font-heading text-5xl font-extralight uppercase leading-[1.08] tracking-[0.05em] sm:text-7xl lg:text-8xl">
              Where Time
              <br />
              <span className="text-champagne">Meets Style</span>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-sm font-light leading-relaxed tracking-wide text-ivory/75 sm:text-base">
              Discover authentic watches from trusted brands, designed for every
              moment &mdash; delivered to your doorstep.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-14">
              <Link
                href="/watches"
                className="group inline-flex items-center gap-3 border-b border-ivory/50 pb-1 text-xs font-medium uppercase tracking-[0.35em] text-ivory transition-colors hover:border-champagne hover:text-champagne"
              >
                Shop the Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#collection"
                className="group inline-flex items-center gap-3 border-b border-ivory/30 pb-1 text-xs font-light uppercase tracking-[0.35em] text-ivory/80 transition-colors hover:border-ivory hover:text-ivory"
              >
                New Arrivals
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
              </Link>
            </div>
          </>
        ) : (
          <div>
            <p className="text-xs font-light uppercase tracking-[0.45em] text-champagne">
              {activeProduct.brand.name}
            </p>
            <h1 className="mx-auto mt-7 max-w-4xl font-heading text-4xl font-extralight uppercase leading-[1.05] tracking-[0.05em] sm:text-6xl lg:text-7xl">
              {activeProduct.name}
            </h1>
            <Link
              href={`/watches/${activeProduct.slug}`}
              className="group mt-10 inline-flex items-center gap-3 border-b border-ivory/50 pb-1 text-xs font-medium uppercase tracking-[0.35em] text-ivory transition-colors hover:border-champagne hover:text-champagne"
            >
              Discover more
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>

      {/* Slide indicators */}
      {len > 1 && (
        <div className="absolute bottom-9 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => fadeTo(i)}
              className={cn(
                "h-px w-8 transition-all duration-300",
                i === active ? "bg-champagne" : "bg-ivory/35 hover:bg-ivory/70"
              )}
              aria-label={`Show slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}