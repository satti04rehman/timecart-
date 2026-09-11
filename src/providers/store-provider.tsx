"use client";

import * as React from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { CartItem } from "@/types";

interface StoreContextValue {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const StoreContext = React.createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useLocalStorage<CartItem[]>("tc-cart", []);
  const [wishlist, setWishlist] = useLocalStorage<string[]>(
    "tc-wishlist",
    []
  );
  const [cartDrawerOpen, setCartDrawerOpen] = React.useState(false);

  const addToCart = React.useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.key === item.key);
      if (existing) {
        return prev.map((i) =>
          i.key === item.key
            ? { ...i, quantity: Math.min(i.maxStock, i.quantity + 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartDrawerOpen(true);
  }, [setCart]);

  const removeFromCart = React.useCallback((key: string) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }, [setCart]);

  const updateQuantity = React.useCallback(
    (key: string, quantity: number) => {
      setCart((prev) =>
        prev.map((i) =>
          i.key === key
            ? { ...i, quantity: Math.max(1, Math.min(i.maxStock, quantity)) }
            : i
        )
      );
    },
    [setCart]
  );

  const clearCart = React.useCallback(() => setCart([]), [setCart]);

  const toggleWishlist = React.useCallback(
    (productId: string) => {
      setWishlist((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
    },
    [setWishlist]
  );

  const isWishlisted = React.useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const cartCount = React.useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = React.useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const value = React.useMemo<StoreContextValue>(
    () => ({
      cart,
      cartCount,
      cartSubtotal,
      cartDrawerOpen,
      openCartDrawer: () => setCartDrawerOpen(true),
      closeCartDrawer: () => setCartDrawerOpen(false),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      wishlist,
      toggleWishlist,
      isWishlisted,
    }),
    [
      cart,
      cartCount,
      cartSubtotal,
      cartDrawerOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      wishlist,
      toggleWishlist,
      isWishlisted,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return ctx;
}