"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clearLocalCustomerData, signOutCustomer } from "@/lib/session";

interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
}

export function SettingsPage() {
  const [form, setForm] = React.useState<ProfileSettings>(() => {
    if (typeof window === "undefined") {
      return { name: "", email: "", phone: "" };
    }
    try {
      return JSON.parse(
        localStorage.getItem("tc-profile") ??
          '{"name":"","email":"","phone":""}'
      );
    } catch {
      return { name: "", email: "", phone: "" };
    }
  });
  const [saved, setSaved] = React.useState(false);

  const onChange = (key: keyof ProfileSettings, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("tc-profile", JSON.stringify(form));
    setSaved(true);
  };

  return (
    <>
      <form onSubmit={save} className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl text-obsidian">Profile Settings</h2>
          <p className="mt-1 text-sm text-text-gray">
            Update your personal details used at checkout.
          </p>
        </div>

        <div className="max-w-lg rounded-xl border border-soft-gray bg-white p-6">
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <div className="mt-1.5">
                <Input
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="Ali Hassan"
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="mt-1.5">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <div className="mt-1.5">
                <Input
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  placeholder="03XX-XXXXXXX"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" className="gap-2">
              {saved && <Check className="h-4 w-4" />}
              {saved ? "Saved" : "Save Changes"}
            </Button>
            {saved && (
              <span className="text-sm text-emerald-700">
                Profile updated successfully.
              </span>
            )}
          </div>
        </div>
        <div className="max-w-lg rounded-xl border border-soft-gray bg-white p-6">
          <h2 className="font-heading text-lg text-obsidian">Sign out</h2>
          <p className="mt-2 text-sm text-text-gray">
            Sign out of this browser. Your cart and wishlist stay on this device.
          </p>
          <SignOutControl className="mt-4" />
        </div>
      </form>

      <div className="mt-6">
        <DeleteAccountSection />
      </div>
    </>
  );
}

function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");

  const onConfirm = async () => {
    setError("");
    setPending(true);
    try {
      const configuredRes = await fetch("/api/config");
      const data = (await configuredRes.json()) as {
        supabaseConfigured?: boolean;
      };
      if (data.supabaseConfigured) {
        const res = await fetch("/api/account/delete", { method: "POST" });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            body.error ?? "We couldn't delete your account. Please try again."
          );
        }
      }
      clearLocalCustomerData();
      setPending(false);
      router.replace("/");
      window.setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      setPending(false);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <>
      <div className="max-w-lg rounded-xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="font-heading text-lg text-red-700">
          Delete your account
        </h2>
        <p className="mt-2 text-sm text-text-gray">
          Permanently removes your TimeCart account, orders, wishlist and saved
          addresses. This action cannot be undone.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTriggerButton onClick={() => setOpen(true)} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                This permanently removes your TimeCart account, profile,
                wishlist, orders and address book. Your cart and order history
                on this device will also be cleared. This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={pending}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                {pending ? "Deleting…" : "Delete My Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

function DialogTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="mt-4 border-red-300 text-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white"
    >
      <Trash2 className="h-4 w-4" />
      Delete My Account
    </Button>
  );
}

function SignOutControl({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const onSignOut = async () => {
    setPending(true);
    await signOutCustomer();
    setPending(false);
    router.replace("/");
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={onSignOut}
      disabled={pending}
    >
      <LogOut className="h-4 w-4" />
      {pending ? "Signing out…" : "Sign Out"}
    </Button>
  );
}