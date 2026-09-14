"use client";

import * as React from "react";
import { Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface InquiryRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function ContactManager() {
  const [rows, setRows] = React.useState<InquiryRow[] | null>(null);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [filter, setFilter] = React.useState("ALL");

  const load = React.useCallback((f = filter) => {
    fetch(`/api/admin/contact${f === "UNREAD" ? "?unread=1" : ""}`)
      .then((r) => r.json())
      .then((d) => {
        setRows(d.inquiries);
        setUnreadCount(d.unreadCount);
      });
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const setRead = async (id: string, isRead: boolean) => {
    const res = await fetch("/api/admin/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead }),
    });
    const data = await res.json();
    if (data.ok) load();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/contact?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      toast.success("Inquiry deleted");
      load();
    } else {
      toast.error(data.error ?? "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="admin-eyebrow">Support</p>
          <h1 className="admin-title mt-1 text-3xl text-obsidian">Inquiries</h1>
          <p className="mt-2 text-sm text-text-gray">
            Messages from the contact form.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {["ALL", "UNREAD"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-9 rounded-full px-4 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-champagne text-obsidian"
                : "border border-obsidian/15 text-text-gray hover:text-obsidian"
            }`}
          >
            {f === "ALL" ? "All" : "Unread only"}
          </button>
        ))}
      </div>

      {rows === null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-obsidian/5" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ivory/20 p-14 text-center text-ivory/50">
          No inquiries.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((i) => (
            <div
              key={i.id}
              className={`rounded-xl bg-ivory p-5 ${i.isRead ? "" : "ring-2 ring-champagne/40"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-obsidian">
                    {i.name} <span className="text-xs font-normal text-text-gray">· {i.email}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-text-gray">
                    {i.subject ?? "General Inquiry"} ·{" "}
                    {new Date(i.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!i.isRead && (
                    <button
                      onClick={() => setRead(i.id, true)}
                      className="rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-200"
                    >
                      Mark read
                    </button>
                  )}
                  {i.isRead && (
                    <span className="flex items-center gap-1 rounded-lg bg-soft-gray px-2.5 py-1.5 text-xs font-medium text-text-gray">
                      <Mail className="h-3.5 w-3.5" /> Read
                    </span>
                  )}
                  <button
                    onClick={() => remove(i.id)}
                    className="rounded-lg p-2 text-text-gray transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line rounded-lg bg-soft-gray/40 p-3 text-sm text-obsidian">
                {i.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}