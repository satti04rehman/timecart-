"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveProductImage } from "@/lib/product-images";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

type Slide =
  | { kind: "video"; url: string; key: string }
  | { kind: "image"; url: string; alt: string | null; key: string };

export function ProductGallery({
  images,
  videoUrl,
}: {
  images: GalleryImage[];
  videoUrl?: string | null;
}) {
  const [active, setActive] = React.useState(0);
  const [fading, setFading] = React.useState(false);

  const list = React.useMemo<Slide[]>(() => {
    const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
    const slides: Slide[] = videoUrl
      ? [{ kind: "video", url: videoUrl, key: "video" }]
      : [];
    for (const img of sorted) {
      slides.push({ kind: "image", url: img.url, alt: img.alt, key: img.id });
    }
    return slides;
  }, [images, videoUrl]);

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
    return <div className="aspect-square w-full rounded-xl bg-soft-gray/60" />;
  }

  const current = list[Math.min(active, list.length - 1)];

  return (
    <div>
      <div className="group relative aspect-square w-full overflow-hidden rounded-xl border border-soft-gray bg-obsidian">
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            fading ? "opacity-0" : "opacity-100"
          )}
        >
          {current.kind === "video" ? (
            <video
              src={current.url}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          ) : (
            <Image
              src={resolveProductImage(current.url)}
              alt={current.alt ?? "Watch image"}
              fill
              priority={active === 0 && current.kind === "image"}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
        </div>
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-soft-gray bg-ivory/80 text-obsidian opacity-0 backdrop-blur transition-all hover:bg-ivory group-hover:opacity-100"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-soft-gray bg-ivory/80 text-obsidian opacity-0 backdrop-blur transition-all hover:bg-ivory group-hover:opacity-100"
              aria-label="Next"
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
          {list.map((slide, i) => (
            <button
              key={slide.key}
              onClick={() => setActive(i)}
              className={cn(
                "relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-white transition-all",
                i === active
                  ? "border-obsidian"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
              aria-label={`View slide ${i + 1}`}
            >
              {slide.kind === "video" ? (
                <span className="flex h-full w-full items-center justify-center bg-obsidian">
                  <Play className="h-5 w-5 fill-ivory text-ivory" />
                </span>
              ) : (
                <Image
                  src={resolveProductImage(slide.url)}
                  alt={slide.alt ?? "Thumbnail"}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}