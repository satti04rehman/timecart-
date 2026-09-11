"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Truck, Search, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

interface TrackedOrder {
  orderNumber: string;
  date: string;
  customerName: string;
  status: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  paymentMethod: string;
  address: string;
  city: string;
  phone: string;
}

const STATUS_FLOW: { key: string; label: string; desc: string }[] = [
  { key: "Confirmed", label: "Order Confirmed", desc: "We have received your order" },
  { key: "Verification", label: "Verification", desc: "Our team is verifying your details" },
  { key: "Dispatched", label: "Dispatched", desc: "Your order is on its way" },
  { key: "Delivered", label: "Delivered", desc: "Enjoy your new timepiece" },
];

function statusIndex(status: string): number {
  if (status === "Processing" || status === "Awaiting Deposit")
    return 1;
  if (status === "Dispatched") return 2;
  if (status === "Delivered") return 3;
  return 0;
}

export function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("number") ?? "";
  const [query, setQuery] = React.useState(initial);
  const [input, setInput] = React.useState(initial);
  const [order, setOrder] = React.useState<TrackedOrder | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  const lookup = React.useCallback((num: string) => {
    if (!num) {
      setOrder(null);
      setNotFound(false);
      return;
    }
    let all: TrackedOrder[] = [];
    try {
      all = JSON.parse(localStorage.getItem("tc-orders") ?? "[]");
    } catch {}
    const direct = localStorage.getItem(`tc-order-${num}`);
    if (direct) {
      try {
        all.push(JSON.parse(direct));
      } catch {}
    }
    all = all.filter(
      (o, i, arr) => arr.findIndex((x) => x.orderNumber === o.orderNumber) === i
    );
    const found = all.find(
      (o) => o.orderNumber.toLowerCase() === num.trim().toLowerCase()
    );
    setOrder(found ?? null);
    setNotFound(!found);
  }, []);

  React.useEffect(() => {
    lookup(query);
  }, [query, lookup]);

  const current = order ? statusIndex(order.status) : 0;

  return (
    <div className="container-tc py-10 lg:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">
        Order Status
      </p>
      <h1 className="mt-2 font-heading text-3xl lg:text-4xl">Track Your Order</h1>
      <p className="mt-2 text-sm text-text-gray">
        Enter your TimeCart order number to see live status.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(input.trim());
        }}
        className="mt-6 flex max-w-md gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. TC-123456"
          className="uppercase"
        />
        <Button type="submit">
          <Search className="mr-2 h-4 w-4" /> Track
        </Button>
      </form>

      {notFound && query && (
        <div className="mt-8 max-w-md rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          No order found for{" "}
          <span className="font-semibold">"{query}"</span>. Double-check the
          order number in your confirmation message.
        </div>
      )}

      {!notFound && !order && query === "" && (
        <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-soft-gray p-12 text-center">
          <PackageCheck className="h-10 w-10 text-champagne" />
          <p className="mt-3 max-w-sm text-sm text-text-gray">
            New here? Place an order and track it here in real time. Orders
            placed in this browser session appear instantly.
          </p>
        </div>
      )}

      {order && (
        <div className="mt-10 grid max-w-4xl gap-8 lg:grid-cols-[1fr_320px]">
          {/* Timeline */}
          <div className="rounded-xl border border-soft-gray bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading text-xl text-obsidian">
                {order.orderNumber}
              </h2>
              <span className="rounded-full bg-champagne/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-champagne">
                {order.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-gray">
              Placed {new Date(order.date).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>

            <ol className="mt-8 space-y-0">
              {STATUS_FLOW.map((step, i) => {
                const done = i < current;
                const active = i === current;
                return (
                  <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < STATUS_FLOW.length - 1 && (
                      <div
                        className={
                          done
                            ? "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 bg-emerald-500"
                            : "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 bg-soft-gray"
                        }
                      />
                    )}
                    <span
                      className={
                        done
                          ? "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white"
                          : active
                            ? "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-obsidian text-xs font-bold text-ivory ring-4 ring-champagne/30"
                            : "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-gray text-xs font-semibold text-text-gray"
                      }
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <div className="pt-1">
                      <p
                        className={
                          active
                            ? "font-semibold text-obsidian"
                            : done
                              ? "font-semibold text-obsidian"
                              : "font-medium text-text-gray"
                        }
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-sm text-text-gray">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="rounded-xl border border-soft-gray bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-obsidian">
                Items
              </h3>
              <div className="mt-4 space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-text-gray">
                      {item.name} × {item.qty}
                    </span>
                    <span className="font-medium text-obsidian">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="my-4 h-px bg-soft-gray" />
              <div className="flex justify-between text-sm">
                <span className="text-text-gray">Total</span>
                <span className="font-heading text-lg text-obsidian">
                  {formatPrice(order.total)}
                </span>
              </div>
              <p className="mt-2 text-xs text-text-gray">
                Payment: {order.paymentMethod}
              </p>
            </div>

            <div className="rounded-xl border border-soft-gray bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-obsidian">
                Delivery Address
              </h3>
              <p className="mt-3 text-sm text-obsidian">
                {order.customerName}
                <br />
                <span className="text-text-gray">
                  {order.address}, {order.city}
                  <br />
                  {order.phone}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-soft-gray/50 p-4 text-sm text-text-gray">
              <Truck className="h-5 w-5 shrink-0 text-champagne" />
              Estimated delivery is 3–5 working days after verification.
            </div>
          </div>
        </div>
      )}

      <div className="mt-12">
        <Button asChild variant="outline">
          <Link href="/watches">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}