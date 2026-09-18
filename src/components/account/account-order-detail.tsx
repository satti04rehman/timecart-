"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { readStoredOrder } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const STATUS_FLOW: { key: string; label: string; desc: string }[] = [
  { key: "Confirmed", label: "Order Confirmed", desc: "We have received your order" },
  { key: "Verification", label: "Verification", desc: "Our team is verifying your details" },
  { key: "Dispatched", label: "Dispatched", desc: "Your order is on its way" },
  { key: "Delivered", label: "Delivered", desc: "Enjoy your new timepiece" },
];

function statusIndex(status: string): number {
  if (status === "Processing" || status === "Awaiting Deposit") return 1;
  if (status === "Dispatched") return 2;
  if (status === "Delivered") return 3;
  return 0;
}

export function OrderDetail() {
  const params = useParams<{ number: string }>();
  const number = decodeURIComponent(params.number);
  const [order] = React.useState(() => readStoredOrder(number));

  if (!order) notFound();

  const current = statusIndex(order.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl text-obsidian">
            {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-text-gray">
            Placed{" "}
            {new Date(order.date).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span className="rounded-full bg-champagne/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-champagne">
          {order.status}
        </span>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-soft-gray bg-white p-6">
        <ol className="space-y-0">
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
                  <p className="mt-0.5 text-sm text-text-gray">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Items */}
        <div className="rounded-xl border border-soft-gray bg-white p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-obsidian">
            Items
          </h3>
          <div className="mt-4 space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-3 text-sm">
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
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-700">
              <span>Discount</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          {order.shipping > 0 && (
            <div className="mt-2 flex justify-between text-sm text-text-gray">
              <span>Shipping</span>
              <span>{formatPrice(order.shipping)}</span>
            </div>
          )}
          {order.deposit > 0 && (
            <div className="mt-2 flex justify-between text-sm text-amber-700">
              <span>Advance paid</span>
              <span>{formatPrice(order.deposit)}</span>
            </div>
          )}
          <div className="mt-3 flex justify-between">
            <span className="font-medium text-obsidian">Total</span>
            <span className="font-heading text-xl text-obsidian">
              {formatPrice(order.total)}
            </span>
          </div>
          <p className="mt-2 text-xs text-text-gray">
            Payment: {order.paymentMethod}
          </p>
        </div>

        {/* Address */}
        <div className="rounded-xl border border-soft-gray bg-white p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-obsidian">
            Delivery Address
          </h3>
          <p className="mt-4 text-sm text-obsidian">
            {order.customerName}
            <br />
            <span className="text-text-gray">
              {order.address}, {order.city}
              <br />
              {order.phone}
            </span>
          </p>
          {order.paymentMethod === "Bank Transfer" && (
            <div className="mt-4 rounded-lg bg-soft-gray/40 p-3 text-xs text-text-gray">
              Bank account: Meezan Bank · TimeCart Retail · IBAN: PK36 MEZN
              0000 1428 6013 0014. Please share your transaction ID.
            </div>
          )}
        </div>
      </div>

      <Button asChild variant="outline">
        <Link href="/account/orders">Back to Orders</Link>
      </Button>
    </div>
  );
}