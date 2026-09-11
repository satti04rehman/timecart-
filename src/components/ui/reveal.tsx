"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  up: "translate-y-8",
  down: "-translate-y-8",
  left: "translate-x-8",
  right: "-translate-x-8",
  scale: "scale-95",
  fade: "",
} as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  from?: keyof typeof VARIANTS;
}

/**
 * Fades + slides content in the first time it scrolls into view.
 * Respects prefers-reduced-motion (renders immediately, no transform).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  duration = 800,
  from = "up",
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform,filter] ease-out motion-reduce:transition-none",
        shown
          ? "translate-x-0 translate-y-0 scale-100 opacity-100 blur-0"
          : cn("opacity-0 blur-[2px]", VARIANTS[from]),
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}