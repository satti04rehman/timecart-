"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { resolveProductImage } from "@/lib/product-images";
import type { ProductSummary } from "@/types";

type Value = string | null;

interface Option {
  value: string;
  label: string;
  hint?: string;
  emoji?: string;
}

interface Question {
  key: string;
  question: string;
  emoji: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    key: "gender",
    question: "Who is the watch for?",
    emoji: "🙋",
    options: [
      { value: "MEN", label: "Men", hint: "38–52mm cases", emoji: "🤵" },
      { value: "WOMEN", label: "Women", hint: "26–40mm cases", emoji: "👩" },
      { value: "UNISEX", label: "Unisex / Any", hint: "Versatile sizing", emoji: "🤝" },
    ],
  },
  {
    key: "budget",
    question: "What's your budget?",
    emoji: "💰",
    options: [
      { value: "5000", label: "Under Rs. 5,000", hint: "Everyday basics", emoji: "💵" },
      { value: "5000-15000", label: "Rs. 5,000 – 15,000", hint: "Reliable classics", emoji: "🪙" },
      { value: "15000-30000", label: "Rs. 15,000 – 30,000", hint: "Premium quality", emoji: "💳" },
      { value: "30000-60000", label: "Rs. 30,000 – 60,000", hint: "Luxury tier", emoji: "💰" },
      { value: "60000+", label: "Above Rs. 60,000", hint: "Statement pieces", emoji: "💎" },
    ],
  },
  {
    key: "style",
    question: "Which style fits you?",
    emoji: "✨",
    options: [
      { value: "classic", label: "Classic", hint: "Timeless & elegant", emoji: "🎩" },
      { value: "sport", label: "Sport", hint: "Rugged & active", emoji: "🏃" },
      { value: "minimal", label: "Minimal", hint: "Clean & modern", emoji: "◽" },
      { value: "casual", label: "Casual", hint: "Everyday relaxed", emoji: "👕" },
    ],
  },
  {
    key: "movement",
    question: "Automatic or battery?",
    emoji: "⚙️",
    options: [
      { value: "quartz", label: "Quartz", hint: "Accurate, low maintenance", emoji: "🔋" },
      { value: "automatic", label: "Automatic", hint: "Self-winding, mechanical", emoji: "⚙️" },
      { value: "smart", label: "Smart", hint: "Connected & feature-rich", emoji: "⌚" },
      { value: "any", label: "No preference", hint: "Surprise me", emoji: "🙂" },
    ],
  },
  {
    key: "occasion",
    question: "Mostly worn for…",
    emoji: "🎯",
    options: [
      { value: "everyday", label: "Everyday wear", hint: "Daily companion", emoji: "🏠" },
      { value: "formal", label: "Formal / office", hint: "Business & events", emoji: "💼" },
      { value: "outdoor", label: "Outdoor / sport", hint: "Adventures & training", emoji: "🏔️" },
    ],
  },
];

interface FinderFilters {
  gender?: string;
  budget?: string;
  style?: string;
  movement?: string;
  occasion?: string;
}

function budgetRange(budget: string | undefined): { min?: number; max?: number } {
  if (!budget) return {};
  const [a, b] = budget.split("-");
  const min = Number(a) || undefined;
  const max = Number(b) || undefined;
  return { min, max };
}

const OCCASION_STYLE: Record<string, string> = {
  everyday: "classic",
  formal: "classic",
  outdoor: "sport",
};

function matchesFilters(
  p: ProductSummary & { style?: string | null; occasion?: string | null },
  f: FinderFilters
): boolean {
  if (f.gender && p.gender !== f.gender && f.gender !== "UNISEX")
    return false;
  const { min, max } = budgetRange(f.budget);
  if (min != null && p.salePrice < min) return false;
  if (max != null && p.salePrice > max) return false;
  if (f.movement && f.movement !== "any") {
    const m = (p.movement ?? "").toLowerCase();
    const want = f.movement.toLowerCase();
    if (m !== want && !m.includes(want)) return false;
  }
  const styleKey = f.style ?? OCCASION_STYLE[f.occasion ?? ""];
  if (styleKey) {
    const s = (p.style ?? "").toLowerCase();
    if (s !== styleKey && !s.includes(styleKey)) return false;
  }
  return true;
}

export function WatchFinder() {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, Value>>({});
  const [catalog, setCatalog] = React.useState<ProductSummary[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<ProductSummary[] | null>(null);

  React.useEffect(() => {
    fetch("/api/products?all=1")
      .then((r) => r.json())
      .then((data: { products: (ProductSummary & { style?: string | null; occasion?: string | null })[] }) =>
        setCatalog((data.products as (ProductSummary & { style?: string | null; occasion?: string | null })[]) ?? [])
      )
      .catch(() => setCatalog([]));
  }, []);

  const select = (key: string, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      const filters: FinderFilters = {
        gender: next.gender ?? undefined,
        budget: next.budget ?? undefined,
        style: next.style ?? undefined,
        movement: next.movement ?? undefined,
        occasion: next.occasion ?? undefined,
      };
      setTimeout(() => {
        const matches = catalog.filter((p) => matchesFilters(p, filters));
        setResults(matches);
        setLoading(false);
      }, 400);
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setResults(null);
  };

  const current = QUESTIONS[step];

  return (
    <div>
      {results === null ? (
        <div className="mx-auto max-w-2xl">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-gray">
              {step + 1} of {QUESTIONS.length}
            </span>
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 text-sm text-text-gray transition-colors hover:text-champagne"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft-gray">
            <div
              className="h-full rounded-full bg-champagne transition-all duration-500"
              style={{
                width: `${((step + 1) / QUESTIONS.length) * 100}%`,
              }}
            />
          </div>

          <div className="mt-10 text-center">
            <span className="text-5xl">{current.emoji}</span>
            <h2 className="mt-4 font-heading text-2xl text-obsidian lg:text-3xl">
              {current.question}
            </h2>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {current.options.map((opt) => {
              const selected = answers[current.key] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => select(current.key, opt.value)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border-2 bg-white p-4 text-left transition-all",
                    selected
                      ? "border-obsidian bg-soft-gray/30"
                      : "border-soft-gray hover:border-champagne/60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.emoji}</span>
                    <div>
                      <p className="font-semibold text-obsidian">{opt.label}</p>
                      {opt.hint && (
                        <p className="text-xs text-text-gray">{opt.hint}</p>
                      )}
                    </div>
                  </div>
                  {selected && (
                    <Sparkles className="h-4 w-4 shrink-0 text-champagne" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">
                Your match
              </p>
              <h2 className="mt-2 font-heading text-2xl text-obsidian lg:text-3xl">
                {results.length > 0
                  ? `${results.length} watch${results.length === 1 ? "" : "es"} chosen for you`
                  : "No exact matches"}
              </h2>
            </div>
            <Button variant="outline" onClick={restart} className="gap-2">
              <RefreshCcw className="h-4 w-4" /> Start Over
            </Button>
          </div>

          {results.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-soft-gray p-12 text-center">
              <p className="text-sm text-text-gray">
                We couldn't find a watch matching all criteria. Try loosening
                your budget or style.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={restart}>Retake Quiz</Button>
                <Button asChild variant="outline">
                  <Link href="/watches">Browse All Watches</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((p) => (
                <div
                  key={p.id}
                  className="group relative rounded-xl border border-soft-gray bg-white p-3 transition-shadow hover:shadow-lg"
                >
                  {p.discount > 0 && (
                    <Badge
                      variant="sale"
                      className="absolute left-4 top-4 z-10"
                    >
                      {Math.round(p.discount)}% OFF
                    </Badge>
                  )}
                  <Link
                    href={`/watches/${p.slug}`}
                    className="relative block aspect-square overflow-hidden rounded-lg bg-soft-gray/50"
                  >
                    {p.imageUrl && (
                      <Image
                        src={resolveProductImage(p.imageUrl)}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    )}
                  </Link>
                  <div className="mt-3 px-1 pb-1">
                    <p className="text-[11px] uppercase tracking-wider text-champagne">
                      {p.brand.name}
                    </p>
                    <Link
                      href={`/watches/${p.slug}`}
                      className="mt-0.5 line-clamp-2 text-sm font-medium text-obsidian hover:text-champagne"
                    >
                      {p.name}
                    </Link>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-obsidian">
                        {formatPrice(p.salePrice)}
                      </span>
                      {p.discount > 0 && (
                        <span className="text-xs text-text-gray line-through">
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}