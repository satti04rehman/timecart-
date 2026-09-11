import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK").format(amount);
}

export function getDiscountedPrice(price: number, discount: number): number {
  return Math.round(price * (1 - discount / 100));
}

export function discountPercent(price: number, salePrice: number): number {
  if (price <= 0) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function generateOrderNumber(id: number, date = new Date()): string {
  const d = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `TC-${d}-${String(id).padStart(4, "0")}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of intervals) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}