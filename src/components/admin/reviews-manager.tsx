"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Check, EyeOff, Trash2, X, MessageSquareQuote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Rating } from "@/components/ui/rating";
import { resolveProductImage } from "@/lib/product-images";

interface ReviewRow {
  id: string;
  productName: string;
  productSlug: string;
  author: string;
  rating: number;
  title: string | null;
  content: string;
  status: "PENDING" | "APPROVED" | "HIDDEN";
  createdAt: string;
  imageCount: number;
  images: string[];
}

const STATUS_PILL: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  HIDDEN: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending approval",
  APPROVED: "Published",
  HIDDEN: "Hidden",
};

export function ReviewsManager() {
  const [reviews, setReviews] = React.useState<ReviewRow[] | null>(null);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [query, setQuery] = React.useState("");
  const [detail, setDetail] = React.useState<ReviewRow | null>(null);

  const load = React.useCallback((status = statusFilter, q = query) => {
    fetch(`/api/admin/reviews?status=${status}&q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews);
        setPendingCount(d.pendingCount);
      });
  }, [statusFilter, query]);

  React.useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (data.ok) {
      toast.success(data.demo ? "Updated (demo mode)" : "Review updated");
      load();
    } else {
      toast.error(data.error ?? "Update failed");
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      toast.success("Review deleted");
      setDetail(null);
      load();
    } else {
      toast.error(data.error ?? "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="admin-eyebrow">Community</p>
          <h1 className="admin-title mt-1 text-3xl text-obsidian">Reviews</h1>
          <p className="mt-2 text-sm text-text-gray">
            Moderate customer reviews before they go live — click any review to read it in full.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            {pendingCount} awaiting approval
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              load(statusFilter, e.target.value);
            }}
            placeholder="Search reviews…"
            className="border-obsidian/10 bg-white text-obsidian placeholder:text-text-gray"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            load(e.target.value, query);
          }}
          className="h-10 rounded-lg border border-obsidian/10 bg-white px-3 text-sm text-obsidian outline-none"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="HIDDEN">Hidden</option>
        </select>
      </div>

      {reviews === null ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-obsidian/5" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-obsidian/15 p-14 text-center text-text-gray">
          No reviews match.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-obsidian/10 bg-white">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-obsidian/10 text-left text-xs uppercase tracking-wider text-text-gray">
                <th className="admin-th pl-4">Review</th>
                <th className="admin-th">Product</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Date</th>
                <th className="admin-th pr-4">Moderate</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setDetail(r)}
                  className="cursor-pointer border-b border-obsidian/5 transition-colors last:border-0 hover:bg-obsidian/[0.03]"
                >
                  <td className="py-3 pl-4 pr-4">
                    <div className="flex max-w-md items-start gap-3">
                      <span className="mt-0.5 shrink-0 rounded-lg bg-champagne/15 px-2 py-1 text-xs font-bold text-champagne">
                        {r.rating}★
                      </span>
                      <div>
                        <p className="font-medium text-obsidian">
                          {r.author}
                          {r.title && <span className="ml-1.5 font-semibold text-text-gray">· {r.title}</span>}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-text-gray">{r.content}</p>
                        {r.imageCount > 0 && (
                          <p className="mt-0.5 text-[11px] text-text-gray">{r.imageCount} photo{r.imageCount > 1 ? "s" : ""}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/watches/${r.productSlug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-champagne hover:underline"
                    >
                      {r.productName}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_PILL[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-text-gray">
                    {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      {r.status !== "APPROVED" && (
                        <button
                          onClick={() => setStatus(r.id, "APPROVED")}
                          className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-200"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                      )}
                      {r.status !== "HIDDEN" && (
                        <button
                          onClick={() => setStatus(r.id, "HIDDEN")}
                          className="rounded-lg p-2 text-text-gray transition-colors hover:bg-orange-50 hover:text-orange-600"
                          aria-label="Hide"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      )}
                      {r.status !== "PENDING" && (
                        <button
                          onClick={() => setStatus(r.id, "PENDING")}
                          className="rounded-lg p-2 text-text-gray transition-colors hover:bg-soft-gray hover:text-obsidian"
                          aria-label="Revert to pending"
                        >
                          ↺
                        </button>
                      )}
                      <button
                        onClick={() => remove(r.id)}
                        className="rounded-lg p-2 text-text-gray transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-end justify-center bg-obsidian/60 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => setDetail(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-ivory sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-obsidian/10 bg-ivory px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-obsidian text-champagne">
                  <MessageSquareQuote className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-heading text-lg text-obsidian">Review detail</h2>
                  <p className="text-xs text-text-gray">
                    {detail.author} · {new Date(detail.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-obsidian/15 text-obsidian transition-colors hover:bg-obsidian hover:text-ivory"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <section className="rounded-xl border border-obsidian/10 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Rating value={detail.rating} />
                    <Link
                      href={`/watches/${detail.productSlug}`}
                      className="mt-2 inline-block text-sm font-medium text-champagne hover:underline"
                    >
                      {detail.productName}
                    </Link>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_PILL[detail.status]}`}>
                    {STATUS_LABEL[detail.status] ?? detail.status}
                  </span>
                </div>
                {detail.title && (
                  <h3 className="mt-4 font-heading text-lg text-obsidian">{detail.title}</h3>
                )}
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-gray">
                  {detail.content}
                </p>
              </section>

              {detail.images.length > 0 && (
                <section className="rounded-xl border border-obsidian/10 bg-white p-5">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-gray">
                    Customer photos · {detail.images.length}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {detail.images.map((url, i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-lg border border-obsidian/10 bg-soft-gray"
                      >
                        <Image
                          src={resolveProductImage(url)}
                          alt={`Review photo ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 200px"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-xl border border-obsidian/10 bg-white p-5">
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-gray">
                  Moderation
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {detail.status !== "APPROVED" && (
                    <button
                      onClick={() => setStatus(detail.id, "APPROVED")}
                      className="flex items-center gap-1.5 rounded-lg bg-obsidian px-4 py-2 text-xs font-semibold text-ivory transition-colors hover:bg-obsidian/85"
                    >
                      <Check className="h-3.5 w-3.5 text-champagne" /> Approve & publish
                    </button>
                  )}
                  {detail.status !== "HIDDEN" && (
                    <button
                      onClick={() => setStatus(detail.id, "HIDDEN")}
                      className="flex items-center gap-1.5 rounded-lg border border-obsidian/15 px-4 py-2 text-xs font-semibold text-obsidian transition-colors hover:bg-obsidian hover:text-ivory"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Hide
                    </button>
                  )}
                  <button
                    onClick={() => remove(detail.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete permanently
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}