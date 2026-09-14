"use client";

import * as React from "react";
import Image from "next/image";
import { Search, X, ClipboardList, PackageCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_OPTIONS } from "@/lib/order-status";
import { resolveProductImage } from "@/lib/product-images";

interface AdminOrder {
  id?: string;
  number: string;
  customer: string;
  phone: string;
  items: number;
  total: number;
  payment: string;
  status: string;
  date: string;
  city: string;
}

interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  imageUrl: string | null;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface OrderDetail {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  statusLabel: string;
  paymentMethodLabel: string;
  paymentStatus: string;
  shippingMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  couponCode: string | null;
  couponDiscount: number;
  total: number;
  shippingAddress: Record<string, unknown>;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

const STATUSES = ORDER_STATUS_OPTIONS;

const PROGRESS_FLOW = [
  "Processing",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const TERMINAL_STATUSES = ["Cancelled", "Returned", "Refunded"];

const STATUS_BADGE: Record<string, string> = {
  Processing: "bg-amber-100 text-amber-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Packed: "bg-violet-100 text-violet-700",
  Shipped: "bg-fuchsia-100 text-fuchsia-700",
  "Out for Delivery": "bg-indigo-100 text-indigo-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
  Returned: "bg-orange-100 text-orange-700",
  Refunded: "bg-slate-200 text-slate-700",
};

function ProgressTimeline({ status }: { status: string }) {
  if (TERMINAL_STATUSES.includes(status)) {
    return (
      <div>
        <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-text-gray">
          <span>Journey</span>
          <span className={STATUS_BADGE[status]}>{status}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-0.5 self-stretch rounded bg-red-300" />
          <p className="text-sm text-red-600">
            This order was {status.toLowerCase()} and its journey is complete.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = PROGRESS_FLOW.indexOf(status);
  const active = currentIndex >= 0 ? currentIndex : PROGRESS_FLOW.length - 1;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-text-gray">
        <span>Order progress</span>
        <span>{PROGRESS_FLOW[active]}</span>
      </div>
      <div className="space-y-0">
        {PROGRESS_FLOW.map((step, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <div key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={
                    current
                      ? "flex h-5 w-5 items-center justify-center rounded-full bg-obsidian ring-2 ring-champagne"
                      : done
                        ? "flex h-5 w-5 items-center justify-center rounded-full bg-obsidian"
                        : "flex h-5 w-5 items-center justify-center rounded-full border border-obsidian/20 bg-white"
                  }
                >
                  {done && <PackageCheck className="h-3 w-3 text-champagne" />}
                </span>
                {i < PROGRESS_FLOW.length - 1 && (
                  <span
                    className={`w-0.5 flex-1 ${
                      done ? "bg-obsidian/70" : "bg-obsidian/10"
                    }`}
                    style={{ minHeight: 18 }}
                  />
                )}
              </div>
              <p
                className={
                  current
                    ? "-mt-0.5 text-sm font-semibold text-obsidian"
                    : done
                      ? "-mt-0.5 text-sm text-obsidian/70"
                      : "-mt-0.5 text-sm text-text-gray"
                }
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OrdersManager() {
  const [orders, setOrders] = React.useState<AdminOrder[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [detail, setDetail] = React.useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [activeNumber, setActiveNumber] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders));
  }, []);

  const openDetail = async (number: string, id: string | undefined) => {
    if (!id) {
      toast.info("Demo order — no details available.");
      return;
    }
    setActiveNumber(number);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/orders?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setDetail({ ...data.order, status: data.order.statusLabel });
      } else {
        toast.error(data.error ?? "Couldn't load order details.");
      }
    } catch {
      toast.error("Couldn't load order details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const changeStatus = async (number: string, id: string | undefined, status: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number, id, status }),
    });
    const data = await res.json();
    if (data.ok) {
      toast.success(data.demo ? "Status updated (demo mode)" : "Order updated");
      setOrders((prev) =>
        prev
          ? prev.map((o) => (o.number === number ? { ...o, status } : o))
          : prev
      );
      if (detail && detail.number === number) {
        const updated = {
          ...detail,
          status,
          statusLabel: status,
        };
        setDetail(updated);
        if (status === "Delivered") {
          openDetail(number, detail.id);
        }
      }
    } else {
      toast.error(data.error ?? "Update failed");
    }
  };

  const addressLines = (addr: Record<string, unknown>) => {
    const parts = [
      String(addr.fullName ?? addr.name ?? ""),
      String(addr.address ?? addr.line1 ?? ""),
      String(addr.street ?? ""),
      String(addr.city ?? ""),
      String(addr.state ?? ""),
      String(addr.postalCode ?? addr.zip ?? ""),
    ].filter(Boolean);
    return parts;
  };

  const filtered = (orders ?? []).filter((o) => {
    const matchesQuery =
      !query ||
      o.number.toLowerCase().includes(query.toLowerCase()) ||
      o.customer.toLowerCase().includes(query.toLowerCase()) ||
      o.phone.includes(query);
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="admin-eyebrow">Fulfillment</p>
        <h1 className="admin-title mt-1 text-3xl text-obsidian">Orders</h1>
        <p className="mt-2 text-sm text-text-gray">
          Track, verify and update customer orders — click any order to review its full journey.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order, customer, phone…"
            className="border-obsidian/10 bg-white text-obsidian placeholder:text-text-gray"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-obsidian/10 bg-white px-3 text-sm text-obsidian outline-none"
        >
          <option>All</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {orders === null ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-obsidian/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-obsidian/15 p-14 text-center text-text-gray">
          No orders match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-obsidian/10 bg-white">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-obsidian/10 text-left text-xs uppercase tracking-wider text-text-gray">
                <th className="admin-th pl-4">Order</th>
                <th className="admin-th">Customer</th>
                <th className="admin-th">Items</th>
                <th className="admin-th">Total</th>
                <th className="admin-th">Payment</th>
                <th className="admin-th">Date</th>
                <th className="admin-th pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.number}
                  onClick={() => openDetail(o.number, o.id)}
                  className="cursor-pointer border-b border-obsidian/5 transition-colors last:border-0 hover:bg-obsidian/[0.03]"
                >
                  <td className="py-3 pl-4 pr-4 font-semibold text-obsidian">
                    {o.number}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-obsidian">{o.customer}</p>
                    <p className="text-xs text-text-gray">{o.phone} · {o.city}</p>
                  </td>
                  <td className="py-3 pr-4 text-text-gray">{o.items}</td>
                  <td className="py-3 pr-4 font-semibold text-obsidian">{formatPrice(o.total)}</td>
                  <td className="py-3 pr-4 text-text-gray">{o.payment}</td>
                  <td className="py-3 pr-4 text-text-gray">
                    {new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={o.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => changeStatus(o.number, o.id, e.target.value)}
                      className={`rounded-lg border-0 px-2.5 py-1.5 text-xs font-semibold outline-none ${STATUS_BADGE[o.status] ?? ""}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
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
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-ivory sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-obsidian/10 bg-ivory px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-obsidian text-champagne">
                  <ClipboardList className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-heading text-lg text-obsidian">{detail.number}</h2>
                  <p className="text-xs text-text-gray">
                    Placed {new Date(detail.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
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

            <div className="grid gap-8 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="min-w-0 space-y-7">
                <section className="rounded-xl border border-obsidian/10 bg-white p-5">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-gray">
                    Items · {detail.items.length}
                  </h3>
                  <div className="space-y-3">
                    {detail.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-obsidian/10 bg-soft-gray">
                          {item.imageUrl ? (
                            <Image
                              src={resolveProductImage(item.imageUrl)}
                              alt={item.productName}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-obsidian">{item.productName}</p>
                          <p className="text-xs text-text-gray">
                            {item.sku}
                            {item.variantName ? ` · ${item.variantName}` : ""} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-obsidian">{formatPrice(item.total)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1 border-t border-obsidian/10 pt-3 text-sm">
                    <div className="flex justify-between text-text-gray">
                      <span>Subtotal</span>
                      <span>{formatPrice(detail.subtotal)}</span>
                    </div>
                    {detail.discount > 0 && (
                      <div className="flex justify-between text-text-gray">
                        <span>Discount</span>
                        <span>−{formatPrice(detail.discount)}</span>
                      </div>
                    )}
                    {detail.couponCode && (
                      <div className="flex justify-between text-text-gray">
                        <span>Coupon {detail.couponCode}</span>
                        <span>−{formatPrice(detail.couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-text-gray">
                      <span>Shipping</span>
                      <span>{formatPrice(detail.shipping)}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-base font-semibold text-obsidian">
                      <span>Total</span>
                      <span>{formatPrice(detail.total)}</span>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-obsidian/10 bg-white p-5">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-gray">
                    Customer
                  </h3>
                  <p className="text-sm font-medium text-obsidian">{detail.customerName}</p>
                  <p className="mt-0.5 text-sm text-text-gray">{detail.customerEmail}</p>
                  <p className="text-sm text-text-gray">{detail.customerPhone}</p>
                </section>

                <section className="rounded-xl border border-obsidian/10 bg-white p-5">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-gray">
                    Shipping address
                  </h3>
                  {addressLines(detail.shippingAddress).map((line, i) => (
                    <p key={i} className="text-sm text-text-gray">
                      {line}
                    </p>
                  ))}
                  {detail.estimatedDelivery && (
                    <p className="mt-2 text-xs text-text-gray">
                      Estimated delivery by{" "}
                      {new Date(detail.estimatedDelivery).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  {detail.deliveredAt && (
                    <p className="mt-1 text-xs font-medium text-emerald-600">
                      Delivered{" "}
                      {new Date(detail.deliveredAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-xl border border-obsidian/10 bg-white p-5">
                  <ProgressTimeline status={detail.status} />
                </section>

                <section className="rounded-xl border border-obsidian/10 bg-white p-5">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-gray">
                    Payment
                  </h3>
                  <p className="text-sm font-medium text-obsidian">
                    {detail.paymentMethodLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-text-gray">
                    {detail.paymentStatus}
                  </p>
                </section>

                <section className="rounded-xl border border-obsidian/10 bg-white p-5">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-gray">
                    Update status
                  </h3>
                  <select
                    value={detail.status}
                    onChange={(e) =>
                      changeStatus(detail.number, detail.id, e.target.value)
                    }
                    className="w-full rounded-lg border border-obsidian/15 bg-white px-3 py-2.5 text-sm text-obsidian outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </section>

                {detail.notes && (
                  <section className="rounded-xl border border-obsidian/10 bg-white p-5">
                    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-gray">
                      Notes
                    </h3>
                    <p className="text-sm text-text-gray">{detail.notes}</p>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {(detailLoading || (activeNumber && detail === null && detailLoading)) && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-obsidian/50">
          <p className="rounded-full bg-white px-5 py-2 text-sm text-text-gray">
            Loading order details…
          </p>
        </div>
      )}
    </div>
  );
}