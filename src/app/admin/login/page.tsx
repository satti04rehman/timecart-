import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen bg-obsidian">
      <div className="flex w-full max-w-md flex-col justify-center px-6 py-12">
        <Link href="/">
          <Logo variant="light" className="h-8" />
        </Link>
        <div className="mt-10 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-champagne/15 text-champagne">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-heading text-2xl text-ivory">Admin Login</h1>
            <p className="text-sm text-ivory/50">Protected area — staff only.</p>
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        {process.env.NODE_ENV !== "production" && (
          <p className="mt-6 text-xs text-ivory/40">
            Default demo credentials:{" "}
            <code className="bg-white/5 px-1 py-0.5">admin</code> /{" "}
            <code className="bg-white/5 px-1 py-0.5">admin123</code>
          </p>
        )}
      </div>
      <div className="relative ml-auto hidden flex-1 lg:block">
        <video
          src="/videos/animatio-30fps.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-obsidian/70" />
        <div className="absolute bottom-16 left-16 right-32">
          <p className="font-heading text-4xl text-ivory">
            Where time meets <span className="italic text-champagne">style.</span>
          </p>
          <p className="mt-4 text-sm text-ivory/60">
            Manage products, orders, inventory, reviews and more from one
            elegant dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}