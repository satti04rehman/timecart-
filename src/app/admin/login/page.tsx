import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen bg-obsidian">
      <div className="flex w-full max-w-md flex-col justify-center px-6 py-12">
        <Link href="/">
          <Logo variant="light" className="h-8" />
        </Link>
        <div className="mt-10">
          <p className="admin-eyebrow">Private Access</p>
          <h1 className="admin-title mt-3 text-3xl text-ivory">
            Admin<br />Portal
          </h1>
          <p className="mt-3 text-sm font-light text-ivory/50">
            Protected area — staff only.
          </p>
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
          src="/videos/animatio-15fps.mp4?v4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,3,3,0.55)_0%,rgba(3,3,3,0.45)_50%,rgba(3,3,3,0.8)_100%)]" />
        <div className="absolute bottom-16 left-16 right-32">
          <p className="admin-eyebrow">Time Cart</p>
          <p className="admin-title mt-4 max-w-lg text-4xl leading-[1.1] text-ivory">
            Where time meets <span className="text-champagne">style.</span>
          </p>
          <p className="mt-5 text-sm font-light text-ivory/55">
            Manage products, orders, inventory, reviews and more from one
            elegant dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}