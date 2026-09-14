"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";

async function supabaseConfigured(): Promise<boolean> {
  try {
    const res = await fetch("/api/config");
    const data = await res.json();
    return Boolean(data.supabaseConfigured);
  } catch {
    return false;
  }
}

type Provider = "google";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [oauthPending, setOauthPending] = React.useState<Provider | null>(null);
  const [configured, setConfigured] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    supabaseConfigured().then(setConfigured);
  }, []);

  const signInWithOAuth = async (provider: Provider) => {
    const isConfigured = await supabaseConfigured();
    if (!isConfigured) {
      setError("Connect Supabase to enable Google sign-in.");
      return;
    }
    setError("");
    setOauthPending(provider);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setOauthPending(null);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);

    const isConfigured = await supabaseConfigured();
    if (!isConfigured) {
      // Demo mode — create a local session and continue.
      localStorage.setItem(
        "tc-session",
        JSON.stringify({
          email,
          name: name || email.split("@")[0],
          demo: true,
        })
      );
      router.push("/account");
      setPending(false);
      return;
    }

    try {
      const supabase = createClient();
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        router.push("/account?welcome=1");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const res = await fetch("/api/profile");
        const profile = await res.json().catch(() => null);
        if (profile?.blocked) {
          await supabase.auth.signOut();
          setError("This account has been blocked by TimeCart.");
          setPending(false);
          return;
        }
        router.push("/account");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-soft-gray bg-white p-8 shadow-sm">
      <div className="flex justify-center">
        <Logo className="h-8" />
      </div>
      <h1 className="mt-5 text-center font-heading text-2xl text-obsidian">
        {mode === "login" ? "Welcome Back" : "Create Your Account"}
      </h1>
      <p className="mt-2 text-center text-sm text-text-gray">
        {mode === "login"
          ? "Sign in to manage orders and wishlist."
          : "Join TimeCart to track orders and save your favourites."}
      </p>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => signInWithOAuth("google")}
          disabled={oauthPending === "google"}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-soft-gray bg-white px-4 py-2.5 text-sm font-medium text-obsidian transition-colors hover:bg-soft-gray/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          {oauthPending === "google"
            ? "Connecting to Google…"
            : "Continue with Google"}
        </button>
        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-soft-gray" />
          <span className="text-xs text-text-gray">or</span>
          <span className="h-px flex-1 bg-soft-gray" />
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-2 space-y-4">
        {mode === "register" && (
          <div>
            <Label>Full Name</Label>
            <div className="mt-1.5">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ali Hassan"
              />
            </div>
          </div>
        )}
        <div>
          <Label>Email</Label>
          <div className="mt-1.5">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <Label>Password</Label>
          <div className="mt-1.5">
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending
            ? "Please wait…"
            : mode === "login"
              ? "Sign In"
              : "Create Account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-text-gray">
        {mode === "login" ? (
          <>
            New to TimeCart?{" "}
            <Link
              href="/register"
              className="font-medium text-champagne hover:underline"
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-champagne hover:underline"
            >
              Sign in
            </Link>
          </>
        )}
      </p>

      {configured === false && (
        <div className="mt-5 rounded-lg bg-soft-gray/50 p-3 text-center text-xs text-text-gray">
          Demo mode: accounts are stored locally in this browser. Connect
          Supabase to enable real authentication, including Google sign-in.
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}