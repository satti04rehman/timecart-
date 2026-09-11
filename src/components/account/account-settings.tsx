"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    </form>
  );
}