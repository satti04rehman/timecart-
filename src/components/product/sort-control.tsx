"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

const SORTS = [
  { value: "", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Best Rated" },
  { value: "bestselling", label: "Best Selling" },
  { value: "discount", label: "Biggest Discount" },
];

export function SortControl({ onOpenFilters }: { onOpenFilters?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "";

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (value) params.set("sort", value);
    else params.delete("sort");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const current = SORTS.find((s) => s.value === sort) ?? SORTS[0];

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenFilters}
          className="gap-1.5"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
        </Button>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-sm text-text-gray sm:inline">Sort by</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="min-w-[180px] justify-between gap-2 font-normal"
            >
              {current.label}
              <ChevronDown className="h-3.5 w-3.5 text-text-gray" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORTS.map((s) => (
              <DropdownMenuItem
                key={s.value}
                onClick={() => setSort(s.value)}
                className={s.value === sort ? "text-champagne font-semibold" : ""}
              >
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}