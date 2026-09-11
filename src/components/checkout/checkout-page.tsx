"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Lock, ChevronLeft, Truck, CreditCard, RotateCcw } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatPrice } from "@/lib/utils";
import { saveStoredOrder, type StoredOrder } from "@/lib/orders";

const MAX_COD = 60000;
const HIGH_ORDER_THRESHOLD = 60000;
const DEPOSIT_RATE = 0.5;

type PaymentMethod = "cod" | "bank" | null;

export function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useStore();

  const [step, setStep] = React.useState(1);
  const [orderNumber, setOrderNumber] = React.useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = React.useState<StoredOrder | null>(null);

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [payment, setPayment] = React.useState<PaymentMethod>(null);
  const [coupon, setCoupon] = React.useState<{
    code: string;
    type: "PERCENTAGE" | "FIXED";
    value: number;
    minOrder: number;
    maxDiscount: number | null;
  } | null>(null);
  const [couponInput, setCouponInput] = React.useState("");
  const [couponError, setCouponError] = React.useState("");
  const [couponPending, setCouponPending] = React.useState(false);
  const [placing, setPlacing] = React.useState(false);

  const subtotal = cartSubtotal;
  const shipping = subtotal > 0 && subtotal < 10000 ? 199 : 0;

  let discount = 0;
  if (coupon) {
    const raw =
      coupon.type === "PERCENTAGE"
        ? (subtotal * coupon.value) / 100
        : coupon.value;
    discount = Math.min(
      raw,
      coupon.maxDiscount ?? raw,
      coupon.type === "PERCENTAGE" ? subtotal : subtotal
    );
  }

  const total = Math.max(0, subtotal - discount) + shipping;

  const codAvailable = total <= MAX_COD;
  const needsDeposit = total > HIGH_ORDER_THRESHOLD;
  const deposit = payment === "bank" && needsDeposit ? total * DEPOSIT_RATE : 0;

  const step2Locked = !(form.name && form.phone && form.address && form.city);
  const step3Locked = !payment || (needsDeposit && !(payment === "bank"));

  const applyCoupon = async () => {
    setCouponError("");
    setCouponPending(true);
    try {
      const res = await fetch(
        `/api/coupons/validate?code=${encodeURIComponent(
          couponInput.trim().toUpperCase()
        )}`
      );
      const data = await res.json();
      if (data.valid) setCoupon(data.coupon);
      else setCouponError(data.error ?? "Invalid coupon");
    } catch {
      setCouponError("Could not validate coupon");
    } finally {
      setCouponPending(false);
    }
  };

  const placeOrder = () => {
    if (step2Locked || step3Locked) return;
    setPlacing(true);
    const num = `TC-${Date.now().toString().slice(-6)}`;
    const order: StoredOrder = {
      orderNumber: num,
      date: new Date().toISOString(),
      customerName: form.name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      paymentMethod:
        payment === "cod" ? "Cash on Delivery" : "Bank Transfer",
      subtotal,
      shipping,
      discount,
      deposit,
      total,
      status: needsDeposit || payment === "bank" ? "Awaiting Deposit" : "Processing",
      items: cart.map((i) => ({
        name: i.name,
        qty: i.quantity,
        price: i.unitPrice,
      })),
    };
    saveStoredOrder(order);
    setOrderNumber(num);
    setPlacedOrder(order);
    clearCart();
    setPlacing(false);
  };

  if (orderNumber && placedOrder) {
    return <OrderSuccess order={placedOrder} paymentDetail={payment} />;
  }

  if (cart.length === 0 && !orderNumber) {
    return (
      <div className="container-tc flex flex-col items-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-soft-gray">
          <Lock className="h-7 w-7 text-text-gray" />
        </div>
        <h1 className="mt-6 font-heading text-2xl text-obsidian">
          Your bag is empty
        </h1>
        <Button asChild className="mt-8">
          <Link href="/watches">Shop Watches</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-tc py-10 lg:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">
        Secure Checkout
      </p>
      <h1 className="mt-2 font-heading text-3xl lg:text-4xl">Checkout</h1>

      {/* Steps */}
      <div className="mt-6 flex items-center gap-2 text-sm">
        {[
          { n: 1, label: "Delivery" },
          { n: 2, label: "Payment" },
          { n: 3, label: "Review" },
        ].map((s, i) => (
          <React.Fragment key={s.n}>
            {i > 0 && <div className="h-px w-8 bg-soft-gray" />}
            <button
              onClick={() => step > s.n && setStep(s.n)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors",
                step === s.n
                  ? "border-obsidian bg-obsidian text-ivory"
                  : step > s.n
                    ? "border-champagne bg-champagne/10 text-champagne"
                    : "border-soft-gray text-text-gray"
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px]">
                {step > s.n ? <Check className="h-3 w-3" /> : s.n}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {step === 1 && (
            <div className="space-y-5 rounded-xl border border-soft-gray bg-white p-6">
              <div>
                <h2 className="font-heading text-lg text-obsidian">
                  Contact Information
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name">
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Ali Hassan"
                    />
                  </Field>
                  <Field label="Phone Number">
                    <Input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="03XX-XXXXXXX"
                    />
                  </Field>
                  <Field label="Email (optional)" className="sm:col-span-2">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="you@example.com"
                    />
                  </Field>
                </div>
              </div>

              <div className="h-px bg-soft-gray" />

              <div>
                <h2 className="font-heading text-lg text-obsidian">
                  Delivery Address
                </h2>
                <div className="mt-4 grid gap-4">
                  <Field label="Street Address">
                    <Textarea
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="House #, Street, Area"
                      rows={2}
                    />
                  </Field>
                  <Field label="City">
                    <Input
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      placeholder="Karachi"
                    />
                  </Field>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-1 text-sm text-text-gray hover:text-obsidian"
                >
                  <ChevronLeft className="h-4 w-4" /> Back to bag
                </Link>
                <Button onClick={() => setStep(2)} disabled={step2Locked}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 rounded-xl border border-soft-gray bg-white p-6">
              <h2 className="font-heading text-lg text-obsidian">
                Payment Method
              </h2>

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors",
                  payment === "cod"
                    ? "border-obsidian bg-soft-gray/30"
                    : "border-soft-gray hover:border-champagne/50"
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  className="mt-1 accent-obsidian"
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                  disabled={!codAvailable}
                />
                <div>
                  <p className="flex items-center gap-2 font-semibold text-obsidian">
                    <Truck className="h-4 w-4 text-champagne" />
                    Cash on Delivery
                  </p>
                  <p className="mt-1 text-sm text-text-gray">
                    Pay in cash when your order arrives at your doorstep.
                  </p>
                  {!codAvailable && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      COD is unavailable for orders above{" "}
                      {formatPrice(MAX_COD)}.
                    </p>
                  )}
                </div>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors",
                  payment === "bank"
                    ? "border-obsidian bg-soft-gray/30"
                    : "border-soft-gray hover:border-champagne/50"
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  className="mt-1 accent-obsidian"
                  checked={payment === "bank"}
                  onChange={() => setPayment("bank")}
                />
                <div>
                  <p className="flex items-center gap-2 font-semibold text-obsidian">
                    <CreditCard className="h-4 w-4 text-champagne" />
                    Bank Transfer
                  </p>
                  <p className="mt-1 text-sm text-text-gray">
                    {needsDeposit ? (
                      <>
                        For orders above{" "}
                        {formatPrice(HIGH_ORDER_THRESHOLD)}, a{" "}
                        <span className="font-semibold text-obsidian">
                          {Math.round(DEPOSIT_RATE * 100)}% advance
                        </span>{" "}
                        ({formatPrice(total * DEPOSIT_RATE)}) is required to
                        confirm. Balance payable on delivery.
                      </>
                    ) : (
                      <>
                        Pay securely via bank transfer. A{" "}
                        <span className="font-semibold text-obsidian">50%</span>{" "}
                        deposit confirms your order.
                      </>
                    )}
                  </p>
                </div>
              </label>

              {payment === "bank" && (
                <div className="rounded-lg bg-soft-gray/40 p-4 text-sm text-text-gray">
                  <p className="font-semibold text-obsidian">
                    Bank Account Details
                  </p>
                  <p className="mt-1">
                    Bank: Meezan Bank · Account Title: TimeCart Retail ·
                    IBAN: PK36 MEZN 0000 1234 5678 9012
                  </p>
                  <p className="mt-2 text-xs">
                    After transferring the{" "}
                    {formatPrice(needsDeposit ? total * DEPOSIT_RATE : total * DEPOSIT_RATE)},
                    share your transaction ID with our support team to confirm.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="gap-1 text-text-gray"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={step3Locked}>
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 rounded-xl border border-soft-gray bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg text-obsidian">
                  Review & Confirm
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-text-gray"
                >
                  Edit
                </Button>
              </div>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-soft-gray/50">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/watches/${item.productSlug}`}
                        className="line-clamp-1 text-sm font-medium text-obsidian hover:text-champagne"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-text-gray">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-obsidian">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-soft-gray" />

              <div className="grid gap-2 text-sm">
                <Row label="Deliver to">
                  <span>
                    {form.name}, {form.city}
                    <br />
                    {form.address}
                  </span>
                </Row>
                <Row label="Contact">
                  {form.phone}
                </Row>
                <Row label="Payment">
                  {payment === "cod" ? "Cash on Delivery" : "Bank Transfer"}
                  {needsDeposit && payment === "bank" ? " (50% advance)" : ""}
                </Row>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={placing}
                onClick={placeOrder}
              >
                <Lock className="mr-2 h-4 w-4" />
                {placing
                  ? "Placing order…"
                  : `Confirm Order — ${formatPrice(total)}`}
              </Button>
              <p className="text-center text-xs text-text-gray">
                Your order is confirmed instantly. Our team will call you to
                verify delivery details.
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-xl border border-soft-gray bg-white p-6 lg:sticky lg:top-24">
          <h2 className="font-heading text-lg text-obsidian">Order Summary</h2>

          <div className="mt-4 max-h-52 space-y-3 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.key} className="flex justify-between gap-3 text-sm">
                <span className="line-clamp-1 text-text-gray">
                  {item.name} × {item.quantity}
                </span>
                <span className="shrink-0 font-medium text-obsidian">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="mt-5 rounded-lg bg-soft-gray/30 p-3">
            <Label htmlFor="coupon" className="text-xs">
              Coupon code
            </Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="coupon"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="e.g. SALE10"
                className="uppercase"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={applyCoupon}
                disabled={couponPending || !couponInput}
              >
                Apply
              </Button>
            </div>
            {couponError && (
              <p className="mt-2 text-xs text-red-600">{couponError}</p>
            )}
            {coupon && (
              <p className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                {coupon.code} applied
              </p>
            )}
          </div>

          <div className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between text-text-gray">
              <span>Subtotal</span>
              <span className="text-obsidian">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-text-gray">
              <span>Shipping</span>
              <span className={shipping === 0 ? "text-emerald-700" : ""}>
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </span>
            </div>
            {deposit > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Advance due now</span>
                <span>{formatPrice(deposit)}</span>
              </div>
            )}
          </div>

          <div className="my-4 h-px bg-soft-gray" />

          <div className="flex items-center justify-between">
            <span className="font-medium text-obsidian">Total</span>
            <span className="font-heading text-2xl text-obsidian">
              {formatPrice(total)}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-text-gray">
            <RotateCcw className="h-3.5 w-3.5" />
            7-day hassle-free returns on all orders.
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-6 text-text-gray">
      <span className="shrink-0">{label}</span>
      <span className="text-right text-obsidian">{children}</span>
    </div>
  );
}

function OrderSuccess({
  order,
  paymentDetail,
}: {
  order: StoredOrder;
  paymentDetail: string | null;
}) {
  return (
    <div className="container-tc flex flex-col items-center py-16 text-center lg:py-24">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <Check className="h-10 w-10 text-emerald-700" />
      </div>
      <h1 className="mt-6 font-heading text-3xl text-obsidian">
        Order Confirmed!
      </h1>
      <p className="mt-3 max-w-md text-text-gray">
        Thank you, {order.customerName}. Your order has been placed successfully.
      </p>

      <div className="mt-8 w-full max-w-md rounded-xl border border-soft-gray bg-white p-6 text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-gray">Order Number</span>
          <span className="font-heading text-lg text-obsidian">
            {order.orderNumber}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-text-gray">Total</span>
          <span className="font-semibold text-obsidian">
            {formatPrice(order.total)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-text-gray">Payment</span>
          <span className="font-medium text-obsidian">
            {order.paymentMethod}
            {order.deposit > 0 && ` (${formatPrice(order.deposit)} advance)`}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-text-gray">Status</span>
          <span className="font-medium text-amber-700">Awaiting Verification</span>
        </div>
      </div>

      <div className="mt-6 max-w-md rounded-xl bg-soft-gray/50 p-4 text-left text-sm text-text-gray">
        {paymentDetail === "bank" || order.paymentMethod === "Bank Transfer" ? (
          <p>
            Please transfer{" "}
            <span className="font-semibold text-obsidian">
              {order.deposit > 0
                ? formatPrice(order.deposit)
                : formatPrice(order.total * DEPOSIT_RATE)}
            </span>{" "}
            to <span className="font-semibold text-obsidian">Meezan Bank</span>{" "}
            (Account: TimeCart Retail · IBAN: PK36 MEZN 0000 1234 5678 9012)
            and share the transaction ID with our team to confirm. Balance is
            payable on delivery.
          </p>
        ) : (
          <p>
            Keep the order number handy. Our team will call{" "}
            <span className="font-semibold text-obsidian">
              {order.phone}
            </span>{" "}
            to verify your delivery details before dispatch.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href={`/track-order?number=${order.orderNumber}`}>
            Track Order
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/watches">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}