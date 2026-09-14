"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, LogIn, Camera, ImagePlus, X, Loader2 } from "lucide-react";
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

const MAX_IMAGES = 4;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function downscale(dataUrl: string, max = 1400): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      if (scale === 1) {
        resolve(dataUrl);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

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
  const [uploading, setUploading] = React.useState(false);
  const [images, setImages] = React.useState<string[]>([]);
  const deviceInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_IMAGES - images.length;
    const selected = Array.from(files).slice(0, remaining);
    if (selected.length < files.length) {
      toast.error(`You can attach up to ${MAX_IMAGES} photos.`);
    }
    setUploading(true);
    try {
      const prepared: string[] = [];
      for (const file of selected) {
        const raw = await fileToDataUrl(file);
        const dataUrl = await downscale(raw);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "One image couldn't be uploaded.");
          continue;
        }
        prepared.push(data.url);
      }
      if (prepared.length > 0) {
        setImages((prev) => [...prev, ...prepared]);
      }
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

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
          images: images.length > 0 ? images : undefined,
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
      setImages([]);
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

            <div>
              <Label>Photos</Label>
              {images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2.5">
                  {images.map((url, i) => (
                    <div
                      key={url}
                      className="group relative h-20 w-20 overflow-hidden rounded-lg border border-soft-gray"
                    >
                      <Image
                        src={url}
                        alt={`Review photo ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) =>
                            prev.filter((u) => u !== url)
                          )
                        }
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-obsidian/70 text-ivory opacity-0 transition-opacity hover:bg-obsidian group-hover:opacity-100"
                        aria-label="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  ref={deviceInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files).then(() => {
                      if (deviceInputRef.current) {
                        deviceInputRef.current.value = "";
                      }
                    });
                  }}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files).then(() => {
                      if (cameraInputRef.current) {
                        cameraInputRef.current.value = "";
                      }
                    });
                  }}
                />
                <button
                  type="button"
                  onClick={() => deviceInputRef.current?.click()}
                  disabled={uploading || images.length >= MAX_IMAGES}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-obsidian/15 px-3 py-2 text-xs font-medium text-obsidian transition-colors hover:border-obsidian disabled:opacity-40"
                >
                  <ImagePlus className="h-4 w-4" />
                  From device
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading || images.length >= MAX_IMAGES}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-obsidian/15 px-3 py-2 text-xs font-medium text-obsidian transition-colors hover:border-obsidian disabled:opacity-40"
                >
                  <Camera className="h-4 w-4" />
                  Camera
                </button>
                {uploading && (
                  <span className="inline-flex items-center gap-1.5 px-2 text-xs text-text-gray">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading…
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-text-gray">
                Up to {MAX_IMAGES} photos (max 4 MB each).
              </p>
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