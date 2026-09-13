"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";

const DESKTOP_SRC = "/videos/animatio-15fps.mp4?v3";
const MOBILE_SRC = "/videos/animatio-mobile-15fps.mp4?v3";

/**
 * Full-bleed hero that simply plays the campaign video (no scroll scrubbing),
 * Rolex-style: cinematic footage with a small, centered, minimal overlay.
 */
export function HeroVideo() {
  const [src, setSrc] = React.useState(DESKTOP_SRC);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setSrc(mq.matches ? MOBILE_SRC : DESKTOP_SRC);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      className="relative flex h-[85vh] w-full items-center justify-center overflow-hidden bg-obsidian lg:h-screen"
      aria-label="Time Cart cinematic hero"
    >
      <link rel="preload" as="image" href="/images/video-poster.jpg" fetchPriority="high" />
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster="/images/video-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setReady(true)}
        aria-hidden="true"
      />
      {!ready && (
        <div className="absolute inset-0 bg-obsidian" aria-hidden="true" />
      )}

      <div className={`relative z-10 px-6 text-center text-ivory transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
        <p className="text-xs font-light uppercase tracking-[0.5em] text-ivory/70">
          Time Cart &mdash; Fine Timepieces
        </p>
        <h1 className="mx-auto mt-8 max-w-5xl font-heading text-5xl font-extralight uppercase leading-[1.08] tracking-[0.05em] sm:text-7xl lg:text-8xl">
          Timeless Craft.
          <br />
          <span className="text-champagne">Modern Elegance.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-sm font-light leading-relaxed tracking-wide text-ivory/75 sm:text-base">
          Discover watches designed for every moment &mdash; authentic,
          elegant, and delivered to your doorstep.
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
      </div>
    </section>
  );
}