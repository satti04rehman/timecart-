"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function NewsletterForm({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setDone(true);
        setEmail("");
        toast.success("Welcome to the TimeCart loop ✦");
      } else {
        toast.error("That email looks invalid — please check and try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full gap-2">
      {done ? (
        <div className="flex h-11 w-full items-center gap-2 rounded-md border border-champagne/40 bg-champagne/10 px-4 text-sm text-champagne">
          <Check className="h-4 w-4" /> You're subscribed — welcome aboard.
        </div>
      ) : (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className={cn(
              "h-11 w-full rounded-md border px-4 text-sm outline-none transition-colors focus:ring-2 focus:ring-champagne/40",
              variant === "dark"
                ? "border-ivory/20 bg-ivory/5 text-ivory placeholder:text-ivory/40 focus:border-ivory/40"
                : "border-soft-gray bg-white text-obsidian placeholder:text-text-gray/60"
            )}
          />
          <Button
            type="submit"
            variant={variant === "dark" ? "champagne" : "primary"}
            disabled={loading}
            aria-label="Subscribe"
          >
            <span className="hidden sm:inline">Subscribe</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </form>
  );
}