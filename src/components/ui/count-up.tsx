"use client";

import * as React from "react";

const DURATION = 1500;

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function CountUp({ value }: { value: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const startedRef = React.useRef(false);

  const match = value.match(/^([\d,.]+)(.*)$/);
  const tail = match ? match[2] : value;

  React.useEffect(() => {
    if (!match || !ref.current) return;
    const target = Number(match[1].replace(/,/g, ""));
    if (Number.isNaN(target)) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (ref.current) ref.current.textContent = match[1];
      return;
    }

    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || startedRef.current) return;
        startedRef.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / DURATION, 1);
          const current = Math.round(easeOutExpo(t) * target);
          el.textContent = Math.round(current).toLocaleString();
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [match, value]);

  return (
    <span ref={ref}>
      {match?.[1] ?? value}
      {tail}
    </span>
  );
}