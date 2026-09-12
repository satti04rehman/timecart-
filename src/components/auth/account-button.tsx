"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { getCustomer, signOutCustomer, type CustomerSession } from "@/lib/session";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function AccountButton() {
  const router = useRouter();
  const [user, setUser] = React.useState<CustomerSession | null>(null);
  const [checked, setChecked] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    getCustomer().then((u) => {
      if (!active) return;
      setUser(u);
      setChecked(true);
    });

    const client = (async () => {
      try {
        const supabase = (await import("@/lib/supabase/client")).createClient();
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(
            session?.user
              ? {
                  email: session.user.email ?? "",
                  name:
                    (session.user.user_metadata?.full_name as string) ??
                    (session.user.user_metadata?.name as string) ??
                    session.user.email?.split("@")[0] ??
                    "Customer",
                }
              : null
          );
        });
        return () => subscription.unsubscribe();
      } catch {
        return () => {};
      }
    })();

    return () => {
      active = false;
      client.then((cleanup) => cleanup());
    };
  }, []);

  const onSignOut = async () => {
    setPending(true);
    await signOutCustomer();
    setUser(null);
    setPending(false);
    setOpen(false);
    router.replace("/");
    router.refresh();
  };

  if (!checked) {
    return (
      <Button variant="ghost" size="icon" className="hidden rounded-full sm:inline-flex" aria-label="Account">
        <User className="h-[18px] w-[18px]" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="hidden rounded-full sm:inline-flex"
        aria-label="Account"
      >
        <Link href="/account">
          <User className="h-[18px] w-[18px]" />
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hidden rounded-full sm:inline-flex"
          aria-label="Account menu"
        >
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-champagne text-[10px] font-bold text-obsidian">
            {initialsOf(user.name)}
          </span>
          <ChevronDown className="h-3 w-3 text-text-gray" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[220px] rounded-xl border border-soft-gray bg-white p-1.5 shadow-xl shadow-obsidian/10"
        >
          <div className="border-b border-soft-gray px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-obsidian">
              {user.name}
            </p>
            <p className="truncate text-xs text-text-gray">{user.email}</p>
          </div>

          <DropdownMenu.Item asChild>
            <Link
              href="/account"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-obsidian outline-none transition-colors hover:bg-soft-gray/70"
            >
              <LayoutDashboard className="h-4 w-4 text-text-gray" />
              My Account
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/account/orders"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-obsidian outline-none transition-colors hover:bg-soft-gray/70"
            >
              <Heart className="h-4 w-4 text-text-gray" />
              Orders & Wishlist
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-soft-gray" />

          <DropdownMenu.Item
            onSelect={(e) => {
              e.preventDefault();
              onSignOut();
            }}
            disabled={pending}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 outline-none transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {pending ? "Signing out…" : "Sign Out"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}