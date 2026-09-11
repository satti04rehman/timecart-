"use client";

import * as React from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { readStoredOrders } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function OrdersList() {
  const [orders, setOrders] = React.useState(() =>
    typeof window === "undefined" ? [] : readStoredOrders()
  );

  React.useEffect(() => {
    const onStorage = () => setOrders(readStoredOrders());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const sorted = [...orders].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-soft-gray p-14 text-center">
        <Package className="h-10 w-10 text-text-gray" />
        <p className="mt-4 font-heading text-xl text-obsidian">No orders yet</p>
        <p className="mt-2 max-w-sm text-sm text-text-gray">
          When you place an order it will appear here with full tracking.
        </p>
        <Button asChild className="mt-6">
          <Link href="/watches">Shop Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((o) => (
        <Link
          key={o.orderNumber}
          href={`/account/orders/${o.orderNumber}`}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-soft-gray bg-white p-5 transition-colors hover:border-champagne/50"
        >
          <div>
            <p className="font-heading text-lg text-obsidian">{o.orderNumber}</p>
            <p className="mt-0.5 text-xs text-text-gray">
              {new Date(o.date).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              · {o.items.reduce((s, i) => s + i.qty, 0)} item(s)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-champagne/15 px-3 py-1 text-xs font-semibold text-champagne">
              {o.status}
            </span>
            <span className="font-semibold text-obsidian">
              {formatPrice(o.total)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}