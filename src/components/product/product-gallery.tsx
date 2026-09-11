"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = React.useState(0);
  const list = React.useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
    [images]
  );

  if (list.length === 0) {
    return (
      <div className="aspect-square w-full rounded-xl bg-soft-gray/60" />
    );
  }

  const current = list[Math.min(active, list.length - 1)];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-soft-gray bg-white">
        <Image
          src={current.url}
          alt={current.alt ?? "Watch image"}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
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
                src={img.url}
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