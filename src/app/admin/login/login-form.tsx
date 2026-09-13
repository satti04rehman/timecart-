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
    <form action={formAction} className="mt-10 space-y-6">
      <input type="hidden" name="redirect" value={redirectTo} />
      {state?.error && (
        <div className="border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-light text-red-300">
          {state.error}
        </div>
      )}
      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-[10px] font-light uppercase tracking-[0.3em] text-ivory/55"
        >
          Username
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/35" />
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            placeholder="admin"
            className="w-full border-0 border-b border-ivory/20 bg-transparent py-2.5 pl-7 pr-3 text-ivory placeholder:text-ivory/25 focus:border-champagne focus:outline-none focus:ring-0"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-[10px] font-light uppercase tracking-[0.3em] text-ivory/55"
        >
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/35" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full border-0 border-b border-ivory/20 bg-transparent py-2.5 pl-7 pr-3 text-ivory placeholder:text-ivory/25 focus:border-champagne focus:outline-none focus:ring-0"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full border border-champagne py-3 text-xs font-light uppercase tracking-[0.35em] text-champagne transition-colors hover:bg-champagne hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in to Admin"}
      </button>
    </form>
  );
}