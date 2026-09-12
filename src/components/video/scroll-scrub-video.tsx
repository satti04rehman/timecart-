"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ScrollScrubVideoProps {
  src: string;
  mobileSrc?: string;
  poster?: string;
  fps?: number;
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
  hint?: string;
}
export function ScrollScrubVideo({
  src,
  mobileSrc,
  poster,
  fps = 30,
  className,
  overlayClassName,
  children,
  hint,
}: ScrollScrubVideoProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [fallback, setFallback] = React.useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const durationRef = React.useRef(0);
  const frameIntMs = 1000 / fps;
  const lastSeekRef = React.useRef(0);
  const pendingSeekRef = React.useRef(false);

  const currentSrc = mobileSrc ? mobileSrc : src;

  React.useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.pause();

    let active = false;
    let raf = 0;
    let loadTimeout = 0;
    let loadKicked = false;

    // Map scroll progress to a proportional video time, throttled to ~fps
    // seeks per second so even jumpy/heroic scroll feels like a smooth scrub.
    const applyFrame = (progress: number) => {
      if (!durationRef.current) return;
      const duration = durationRef.current;
      const time = Math.min(Math.max(progress, 0), 1) * Math.max(duration - 1 / fps, 0);
      try {
        if (video.seeking) {
          pendingSeekRef.current = true;
        } else if (Math.abs(video.currentTime - time) >= 0.05) {
          video.currentTime = time;
        }
      } catch {
        setFallback(true);
      }
    };

    const computeFrame = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      if (total <= 0) return;
      const progress = Math.min(Math.max(-rect.top / total, 0), 1);
      applyFrame(progress);
    };

    const fpsLoop = () => {
      if (!active) return;
      const now = performance.now();
      if (now - lastSeekRef.current >= frameIntMs) {
        lastSeekRef.current = now;
        computeFrame();
      }
      raf = requestAnimationFrame(fpsLoop);
    };

    const onSeeked = () => {
      if (!pendingSeekRef.current) return;
      pendingSeekRef.current = false;
      computeFrame();
    };

    const onLoaded = () => {
      if (video.duration && Number.isFinite(video.duration)) {
        durationRef.current = video.duration;
      }
      setHasLoaded(true);
      video.currentTime = 0;
      computeFrame();
    };

    const onError = () => setFallback(true);

    const io = new IntersectionObserver(
      ([entry]) => {
        const running = entry.isIntersecting;
        if (running) {
          active = true;
          computeFrame();
          raf = requestAnimationFrame(fpsLoop);
          if (!loadKicked && video.readyState < 3) {
            loadKicked = true;
            loadTimeout = window.setTimeout(() => {
              try {
                video.preload = "auto";
                video.load();
              } catch {
                setFallback(true);
              }
            }, 400);
          }
        } else {
          active = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "150px 0px" }
    );
    io.observe(section);

    if (video.readyState >= 1 && video.duration) onLoaded();
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    lastSeekRef.current = 0;
    requestAnimationFrame(computeFrame);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(loadTimeout);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
  }, [currentSrc, fps, frameIntMs]);

  return (
    <section
      ref={sectionRef}
      className={cn("relative h-[320vh] lg:h-[360vh]", className)}
      aria-label="Cinematic scroll experience"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {fallback ? (
          poster ? (
            <Image
              src={poster}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : null
        ) : (
          <video
            ref={videoRef}
            src={currentSrc}
            poster={poster}
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ willChange: "transform" }}
          />
        )}

        {!hasLoaded && !fallback && poster && (
          <div className="absolute inset-0">
            <Image
              src={poster}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}

        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center bg-obsidian/25",
            overlayClassName
          )}
        >
          {children}
        </div>

        {hint && !fallback && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <div
              className="mx-auto h-9 w-5 rounded-full border border-white/50 flex items-start justify-center pt-1.5"
              aria-hidden="true"
            >
              <span className="h-2 w-1 rounded-full bg-white/80 animate-scroll-hint" />
            </div>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-white/80">
              {hint}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}