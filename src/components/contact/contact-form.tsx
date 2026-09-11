"use client";

import * as React from "react";
import { Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    orderNumber: "",
    message: "",
  });
  const [state, setState] = React.useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setState("done");
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        orderNumber: "",
        message: "",
      });
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="flex flex-col items-center rounded-xl border border-soft-gray bg-white p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-7 w-7 text-emerald-700" />
        </div>
        <h3 className="mt-4 font-heading text-xl text-obsidian">
          Message Sent!
        </h3>
        <p className="mt-2 max-w-sm text-sm text-text-gray">
          Thank you for reaching out. Our team will get back to you within 24
          hours.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setState("idle")}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Full Name *</Label>
          <div className="mt-1.5">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ali Hassan"
            />
          </div>
        </div>
        <div>
          <Label>Email *</Label>
          <div className="mt-1.5">
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <Label>Phone</Label>
          <div className="mt-1.5">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="03XX-XXXXXXX"
            />
          </div>
        </div>
        <div>
          <Label>Subject</Label>
          <div className="mt-1.5">
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="h-10 w-full rounded-lg border border-soft-gray bg-white px-3 text-sm text-obsidian outline-none transition-colors focus:border-obsidian"
            >
              {[
                "General Inquiry",
                "Order Status",
                "Returns & Refunds",
                "Payment / Bank Transfer",
                "Product Question",
                "Feedback",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div>
        <Label>Order Number (if applicable)</Label>
        <div className="mt-1.5">
          <Input
            value={form.orderNumber}
            onChange={(e) =>
              setForm({ ...form, orderNumber: e.target.value })
            }
            placeholder="TC-123456"
            className="uppercase"
          />
        </div>
      </div>
      <div>
        <Label>Message *</Label>
        <div className="mt-1.5">
          <Textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="How can we help?"
          />
        </div>
      </div>

      {state === "error" && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Something went wrong. Please try again.
        </p>
      )}

      <Button type="submit" size="lg" disabled={state === "sending"}>
        {state === "sending" ? (
          "Sending…"
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" /> Send Message
          </>
        )}
      </Button>
    </form>
  );
}