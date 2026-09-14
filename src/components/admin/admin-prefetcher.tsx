"use client";

import * as React from "react";

const ENDPOINTS = [
  "/api/admin/products",
  "/api/admin/categories",
  "/api/admin/brands",
  "/api/admin/orders",
  "/api/admin/coupons",
  "/api/admin/reviews",
  "/api/admin/customers",
  "/api/admin/contact",
];

/**
 * Warms the admin list API functions after the shell hydrates so that
 * page-to-page navigation doesn't pay a cold-start round trip on every
 * manager view. Request bodies are discarded; this is a warm-up only.
 */
export function AdminPrefetcher() {
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const id = window.setTimeout(() => {
      for (const url of ENDPOINTS) {
        fetch(url).catch(() => {});
      }
    }, 800);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}