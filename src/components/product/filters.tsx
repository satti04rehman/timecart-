"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FiltersProps {
  groups: FilterGroup[];
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const PRICE_RANGES: { label: string; min: number; max: number }[] = [
  { label: "Under Rs. 5,000", min: 0, max: 5000 },
  { label: "Rs. 5,000 – 15,000", min: 5000, max: 15000 },
  { label: "Rs. 15,000 – 30,000", min: 15000, max: 30000 },
  { label: "Rs. 30,000 – 60,000", min: 30000, max: 60000 },
  { label: "Above Rs. 60,000", min: 60000, max: 9999999 },
];

const RATINGS = [
  { value: "4", label: "4★ & above" },
  { value: "3", label: "3★ & above" },
];

export function Filters({ groups, mobileOpen, onCloseMobile }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  const updateParam = (key: string, value: string) => {
    params.delete("page");
    if (params.get(key) === value) {
      params.delete(key);
    } else if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleParam = (key: string, value: string) => {
    params.delete("page");
    const existing = params.getAll(key);
    if (existing.includes(value)) {
      params.delete(key);
      existing
        .filter((v) => v !== value)
        .forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setPrice = (min: number, max: number) => {
    params.delete("page");
    if (min === 0) params.delete("min");
    else params.set("min", String(min));
    params.set("max", String(max));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const activeCount = Array.from(searchParams.entries()).filter(
    ([k]) => !["page", "sort", "q"].includes(k)
  ).length;

  const body = (
    <div className="space-y-2">
      <FilterSection label="Price">
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range) => (
            <label
              key={range.label}
              className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm text-obsidian transition-colors hover:bg-soft-gray/50"
            >
              <input
                type="radio"
                name="price"
                checked={
                  params.get("min") === String(range.min) &&
                  params.get("max") === String(range.max)
                }
                onChange={() => setPrice(range.min, range.max)}
                className="h-4 w-4 accent-obsidian"
              />
              {range.label}
            </label>
          ))}
        </div>
      </FilterSection>

      {groups.map((group) => (
        <FilterSection key={group.key} label={group.label}>
          <div className="space-y-1.5">
            {group.options.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm text-obsidian transition-colors hover:bg-soft-gray/50"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={params.getAll(group.key).includes(option.value)}
                    onChange={() => toggleParam(group.key, option.value)}
                    className="h-4 w-4 rounded accent-obsidian"
                  />
                  {option.label}
                </span>
                {option.count != null && (
                  <span className="w-6 text-right text-xs text-text-gray">
                    {option.count}
                  </span>
                )}
              </label>
            ))}
          </div>
        </FilterSection>
      ))}

      <FilterSection label="Rating">
        <div className="space-y-1.5">
          {RATINGS.map((r) => (
            <label
              key={r.value}
              className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm text-obsidian transition-colors hover:bg-soft-gray/50"
            >
              <input
                type="checkbox"
                checked={params.get("rating") === r.value}
                onChange={() => updateParam("rating", r.value)}
                className="h-4 w-4 rounded accent-obsidian"
              />
              {r.label}
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-obsidian">
              Filters
            </h2>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs font-medium text-champagne hover:underline"
              >
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
            {body}
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-obsidian/40"
          onClick={onCloseMobile}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-full max-w-sm bg-ivory p-5 shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-lg text-obsidian">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </h2>
            <button
              onClick={onCloseMobile}
              className="rounded-full p-1.5 text-text-gray hover:bg-soft-gray"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
            {body}
          </div>
          <Button className="mt-6 w-full" onClick={onCloseMobile}>
            View Results
          </Button>
        </div>
      </div>
    </>
  );
}

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="border-b border-soft-gray pb-4 pt-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-1 text-sm font-semibold text-obsidian"
      >
        {label}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-text-gray transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}