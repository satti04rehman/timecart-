"use client";

import * as React from "react";
import Link from "next/link";
import { Star, LogIn } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RatingInput } from "@/components/ui/rating-input";

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSubmitted?: () => void;
}

export function ReviewForm({
  productId,
  productName,
  onSubmitted,
}: ReviewFormProps) {
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [needsSignIn, setNeedsSignIn] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please select a star rating.");
      return;
    }
    if (content.trim().length < 5) {
      toast.error("Please write a short review (at least 5 characters).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setNeedsSignIn(true);
        } else {
          toast.error(data.error ?? "Couldn't save your review.");
        }
        return;
      }
      toast.success(
        data.pending
          ? "Thanks! Your review is pending approval and will appear shortly."
          : "Thanks! Your review has been published."
      );
      setOpen(false);
      setRating(0);
      setTitle("");
      setContent("");
      setNeedsSignIn(false);
      onSubmitted?.();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <Star className="h-4 w-4 fill-champagne text-champagne" />
        Write a review
      </Button>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review this watch</DialogTitle>
          <DialogDescription className="line-clamp-1">
            {productName}
          </DialogDescription>
        </DialogHeader>

        {needsSignIn ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-soft-gray">
              <LogIn className="h-5 w-5 text-text-gray" />
            </div>
            <p className="text-sm text-text-gray">
              Please sign in to publish your rating and review.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Sign in</Link>
            </Button>
            <button
              type="button"
              onClick={() => setNeedsSignIn(false)}
              className="text-xs text-text-gray underline-offset-4 hover:underline"
            >
              Back to writing my review
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="review-rating">Your rating</Label>
              <RatingInput
                value={rating}
                onChange={setRating}
                size={28}
                className="-ml-1 mt-2"
              />
            </div>

            <div>
              <Label htmlFor="review-title">Title (optional)</Label>
              <Input
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="e.g. Great value for money"
              />
            </div>

            <div>
              <Label htmlFor="review-content">Your review</Label>
              <Textarea
                id="review-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={2000}
                placeholder="What did you like or dislike about this watch?"
                required
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting…" : "Submit review"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}