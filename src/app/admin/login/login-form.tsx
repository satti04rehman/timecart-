"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { LockKeyhole, User } from "lucide-react";
import { adminLoginAction } from "./actions";

export function LoginForm() {
  const params = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/admin";
  const [state, formAction, pending] = useActionState(adminLoginAction, null);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      {state?.error && (
        <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}
      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ivory/60"
        >
          Username
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            placeholder="admin"
            className="w-full rounded-lg border border-ivory/15 bg-white/5 py-2.5 pl-9 pr-3 text-ivory placeholder:text-ivory/30 focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ivory/60"
        >
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-ivory/15 bg-white/5 py-2.5 pl-9 pr-3 text-ivory placeholder:text-ivory/30 focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-champagne py-3 text-sm font-semibold uppercase tracking-widest text-obsidian transition-colors hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in to Admin"}
      </button>
    </form>
  );
}