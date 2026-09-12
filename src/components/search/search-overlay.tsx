"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Clock, TrendingUp, X } from "lucide-react";
import { getPopularQueries } from "@/lib/search-data";
import Image from "next/image";
import { resolveProductImage } from "@/lib/product-images";

interface SearchResult {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string | null;
}

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [recent, setRecent] = React.useState<string[]>([]);
  const [popular, setPopular] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setPopular([]);
    setTimeout(() => inputRef.current?.focus(), 50);
    getPopularQueries().then(setPopular);
    try {
      setRecent(JSON.parse(localStorage.getItem("tc-recent-searches") ?? "[]"));
    } catch {
      setRecent([]);
    }
  }, [open]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=6`
        );
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  if (!open) return null;

  const saveRecent = (q: string) => {
    const next = [q, ...recent.filter((r) => r !== q)].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem("tc-recent-searches", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const submit = (q: string) => {
    saveRecent(q);
    onClose();
    router.push(`/watches?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div
        className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-auto mt-20 flex w-full max-w-2xl flex-col rounded-t-xl border border-soft-gray bg-ivory shadow-2xl animate-in slide-in-from-top-4 fade-in-0 duration-200">
        {/* Input row */}
        <div className="flex items-center gap-3 border-b border-soft-gray px-5 py-4">
          <Search className="h-5 w-5 shrink-0 text-text-gray" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) submit(query);
            }}
            placeholder="Search watches, brands…"
            className="w-full bg-transparent text-base outline-none placeholder:text-text-gray/60"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-text-gray hover:text-obsidian"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-soft-gray px-3 py-1 text-xs font-semibold text-obsidian hover:bg-soft-gray/80"
          >
            Esc
          </button>
        </div>

        {/* Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query.trim() ? (
            <div className="space-y-6 px-5 py-6">
              {recent.length > 0 && (
                <div>
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-gray">
                    <Clock className="h-3.5 w-3.5" /> Recent searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        onClick={() => submit(r)}
                        className="rounded-full border border-soft-gray bg-white px-3 py-1.5 text-sm text-obsidian transition-colors hover:border-champagne hover:text-champagne"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {popular.length > 0 && (
                <div>
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-gray">
                    <TrendingUp className="h-3.5 w-3.5" /> Popular searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popular.map((r) => (
                      <button
                        key={r}
                        onClick={() => submit(r)}
                        className="rounded-full border border-soft-gray bg-white px-3 py-1.5 text-sm text-obsidian transition-colors hover:border-champagne hover:text-champagne"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-2 py-3">
              {loading ? (
                <p className="px-3 py-4 text-sm text-text-gray">
                  Searching…
                </p>
              ) : results.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-text-gray">
                    No watches found for{" "}
                    <span className="font-medium text-obsidian">
                      “{query}”
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-text-gray/70">
                    Try “Casio”, “Automatic” or “Men’s watches”.
                  </p>
                </div>
              ) : (
                <div>
                  {results.map((r) => (
                    <Link
                      key={r.id}
                      href={`/watches/${r.slug}`}
                      onClick={() => {
                        saveRecent(query);
                        onClose();
                      }}
                      className="flex items-center gap-4 rounded-md px-3 py-2.5 transition-colors hover:bg-soft-gray/60"
                    >
                      <div className="relative h-11 w-11 overflow-hidden rounded-md bg-white">
                        {r.imageUrl && (
                          <Image
                            src={resolveProductImage(r.imageUrl)}
                            alt={r.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-obsidian">
                          {r.name}
                        </p>
                        <p className="text-xs text-text-gray">
                          {r.brand}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-obsidian">
                        Rs. {r.price.toLocaleString()}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}