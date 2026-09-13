"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Check, EyeOff, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
}

const STATUS_PILL: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  HIDDEN: "bg-red-100 text-red-700",
};

export function ReviewsManager() {
  const [reviews, setReviews] = React.useState<ReviewRow[] | null>(null);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [query, setQuery] = React.useState("");

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
      load();
    } else {
      toast.error(data.error ?? "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-ivory">Reviews</h1>
          <p className="mt-1 text-sm text-ivory/50">
            Moderate customer reviews before they go live.
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              load(statusFilter, e.target.value);
            }}
            placeholder="Search reviews…"
            className="border-ivory/10 bg-ivory text-obsidian placeholder:text-text-gray"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            load(e.target.value, query);
          }}
          className="h-10 rounded-lg border border-ivory/10 bg-ivory px-3 text-sm text-obsidian outline-none"
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
            <div key={i} className="h-20 animate-pulse rounded-xl bg-ivory/5" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ivory/20 p-14 text-center text-ivory/50">
          No reviews match.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-ivory">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-soft-gray text-left text-xs uppercase tracking-wider text-text-gray">
                <th className="py-3 pl-4 pr-4 font-medium">Review</th>
                <th className="py-3 pr-4 font-medium">Product</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Date</th>
                <th className="py-3 pr-4 font-medium">Moderate</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-soft-gray/60 last:border-0">
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
                  <td className="py-3 pr-4">
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
    </div>
  );
}