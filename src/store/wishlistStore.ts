"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  productIds: number[];
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
  /** Merge server IDs into local state (union, no duplicates). */
  syncFromServer: (ids: number[]) => void;
  /** POST current productIds to /api/wishlist (no-op when not logged in). */
  syncToServer: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      addToWishlist: (id) =>
        set((s) =>
          s.productIds.includes(id) ? s : { productIds: [...s.productIds, id] }
        ),
      removeFromWishlist: (id) =>
        set((s) => ({ productIds: s.productIds.filter((p) => p !== id) })),
      toggleWishlist: (id) =>
        get().isInWishlist(id)
          ? get().removeFromWishlist(id)
          : get().addToWishlist(id),
      isInWishlist: (id) => get().productIds.includes(id),
      clearWishlist: () => set({ productIds: [] }),

      syncFromServer: (ids) =>
        set((s) => ({
          productIds: Array.from(new Set([...s.productIds, ...ids])),
        })),

      syncToServer: async () => {
        const { productIds } = get();
        try {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productIds }),
          });
        } catch {
          // Silently swallow — sync is best-effort
        }
      },
    }),
    { name: "ftt-wishlist" }
  )
);
