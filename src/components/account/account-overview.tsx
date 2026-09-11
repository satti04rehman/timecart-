"use client";

import * as React from "react";
import Link from "next/link";
import { Package, Heart, MapPin, ArrowRight } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { readStoredOrders } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function AccountOverview() {
  const { wishlist } = useStore();
  const [orders, setOrders] = React.useState(() =>
    typeof window === "undefined" ? [] : readStoredOrders()
  );

  React.useEffect(() => {
    const onStorage = () => setOrders(readStoredOrders());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const recent = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl text-obsidian">
          Welcome back 👋
        </h2>
        <p className="mt-1 text-sm text-text-gray">
          Here's a snapshot of your TimeCart activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Orders" value={String(orders.length)} icon={Package} />
        <StatCard label="Wishlist" value={String(wishlist.length)} icon={Heart} />
        <StatCard label="Saved Addresses" value="0" icon={MapPin} />
      </div>

      <div className="rounded-xl border border-soft-gray bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg text-obsidian">Recent Orders</h3>
          <Link
            href="/account/orders"
            className="text-sm font-medium text-champagne hover:underline"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-soft-gray p-10 text-center">
            <Package className="h-8 w-8 text-text-gray" />
            <p className="mt-3 text-sm text-text-gray">
              No orders yet. Find your next timepiece and checkout in minutes.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/watches">Shop Watches</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-soft-gray">
            {recent.map((o) => (
              <Link
                key={o.orderNumber}
                href={`/account/orders/${o.orderNumber}`}
                className="flex flex-wrap items-center justify-between gap-3 py-4 transition-colors hover:bg-soft-gray/30"
              >
                <div>
                  <p className="font-semibold text-obsidian">{o.orderNumber}</p>
                  <p className="text-xs text-text-gray">
                    {new Date(o.date).toLocaleDateString("en-US", {
                      dateStyle: "medium",
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
                  <ArrowRight className="h-4 w-4 text-text-gray" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-soft-gray bg-white p-6">
          <h3 className="font-heading text-lg text-obsidian">Need help?</h3>
          <p className="mt-2 text-sm text-text-gray">
            Track an order or check delivery status anytime.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/track-order">Track Order</Link>
          </Button>
        </div>
        <div className="rounded-xl border border-soft-gray bg-white p-6">
          <h3 className="font-heading text-lg text-obsidian">
            Manage delivery addresses
          </h3>
          <p className="mt-2 text-sm text-text-gray">
            Save addresses for faster checkout.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/account/addresses">Manage Addresses</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-soft-gray bg-white p-5">
      <Icon className="h-5 w-5 text-champagne" />
      <p className="mt-3 font-heading text-3xl text-obsidian">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-text-gray">
        {label}
      </p>
    </div>
  );
}