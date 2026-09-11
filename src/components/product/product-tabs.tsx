"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ScrollText } from "lucide-react";

export interface ProductReviewData {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string | Date;
  verified: boolean;
}

interface ProductTabsProps {
  description: string | null;
  specRows: { label: string; value: string }[];
  specsRaw: Record<string, string> | null;
  reviews: ProductReviewData[];
  ratingAvg: number;
  ratingCount: number;
}

export function ProductTabs({
  description,
  specRows,
  reviews,
  ratingAvg,
  ratingCount,
}: ProductTabsProps) {
  const allSpecs = specRows.length > 0 ? specRows : fallbackSpecs;

  return (
    <Tabs defaultValue="description">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">
          Reviews ({ratingCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <div className="prose prose-neutral max-w-3xl text-text-gray">
          {description ? (
            <p className="leading-relaxed">{description}</p>
          ) : (
            <p className="leading-relaxed">
              A timeless timepiece crafted with precision and style. Each watch
              in this collection is selected for its quality, durability and
              design — made to be worn every day and treasured for years.
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="specs" className="mt-6">
        <div className="max-w-3xl overflow-hidden rounded-xl border border-soft-gray">
          <table className="w-full text-sm">
            <tbody>
              {allSpecs.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? "bg-soft-gray/30" : "bg-white"}
                >
                  <td className="w-1/3 px-4 py-3 font-medium text-obsidian">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-text-gray">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <div className="grid max-w-4xl gap-8 lg:grid-cols-[220px_1fr]">
          <div className="text-center lg:border-r lg:border-soft-gray lg:pr-8 lg:text-left">
            <p className="font-heading text-5xl text-obsidian">
              {ratingCount > 0 ? ratingAvg.toFixed(1) : "—"}
            </p>
            <div className="mt-2 flex justify-center lg:justify-start">
              <Rating value={ratingAvg} size="md" showValue={false} />
            </div>
            <p className="mt-2 text-sm text-text-gray">
              {ratingCount} verified review{ratingCount === 1 ? "" : "s"}
            </p>
          </div>

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-soft-gray p-8 text-center text-sm text-text-gray">
                No reviews yet — be the first to review this watch.
              </div>
            ) : (
              reviews.map((r) => (
                <article key={r.id} className="border-b border-soft-gray pb-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-obsidian text-xs font-bold text-ivory">
                        {r.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-obsidian">
                            {r.author}
                          </p>
                          {r.verified && (
                            <Badge variant="success" className="gap-1 px-2 py-0">
                              <ShieldCheck className="h-3 w-3" /> Verified
                            </Badge>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <Rating value={r.rating} size="sm" />
                          <span className="text-xs text-text-gray">
                            {new Date(r.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-text-gray">
                    {r.content}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

const fallbackSpecs: { label: string; value: string }[] = [
  { label: "Brand", value: "TimeCart Exclusive" },
  { label: "Movement", value: "Quartz" },
  { label: "Case Material", value: "Stainless Steel" },
  { label: "Strap Material", value: "Stainless Steel" },
  { label: "Water Resistance", value: "3 ATM" },
  { label: "Warranty", value: "1 Year" },
];