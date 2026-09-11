"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  pages,
}: {
  page: number;
  pages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const go = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) params.delete("page");
    else params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  if (pages <= 1) return null;

  const pageNumbers: (number | "...")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
      pageNumbers.push(i);
    } else if (
      pageNumbers[pageNumbers.length - 1] !== "..."
    ) {
      pageNumbers.push("...");
    }
  }

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5">
      <button
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-soft-gray bg-white text-obsidian transition-colors hover:border-obsidian disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pageNumbers.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="px-2 text-text-gray">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={
              p === page
                ? "h-10 w-10 rounded-md bg-obsidian text-sm font-semibold text-ivory"
                : "h-10 w-10 rounded-md border border-soft-gray bg-white text-sm text-obsidian transition-colors hover:border-obsidian"
            }
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => go(page + 1)}
        disabled={page === pages}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-soft-gray bg-white text-obsidian transition-colors hover:border-obsidian disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}