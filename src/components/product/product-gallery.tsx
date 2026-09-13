"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveProductImage } from "@/lib/product-images";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = React.useState(0);
  const [fading, setFading] = React.useState(false);
  const list = React.useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
    [images]
  );

  const go = React.useCallback(
    (i: number) => {
      if (i === active || i < 0 || i >= list.length) return;
      setFading(true);
      window.setTimeout(() => {
        setActive(i);
        setFading(false);
      }, 300);
    },
    [active, list.length]
  );

  if (list.length === 0) {
    return (
      <div className="aspect-square w-full rounded-xl bg-soft-gray/60" />
    );
  }

  const current = list[Math.min(active, list.length - 1)];

  return (
    <div>
      <div className="group relative aspect-square w-full overflow-hidden rounded-xl border border-soft-gray bg-white">
        <Image
          src={resolveProductImage(current.url)}
          alt={current.alt ?? "Watch image"}
          fill
          priority
          className={cn(
            "object-cover transition-opacity duration-300",
            fading ? "opacity-0" : "opacity-100"
          )}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-soft-gray bg-ivory/80 text-obsidian opacity-0 backdrop-blur transition-all hover:bg-ivory group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-soft-gray bg-ivory/80 text-obsidian opacity-0 backdrop-blur transition-all hover:bg-ivory group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 z-10 rounded-full bg-obsidian/70 px-2.5 py-1 text-[11px] font-medium tabular-nums text-ivory">
              {active + 1} / {list.length}
            </span>
          </>
        )}
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all",
                i === active
                  ? "border-obsidian"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={resolveProductImage(img.url)}
                alt={img.alt ?? "Thumbnail"}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}