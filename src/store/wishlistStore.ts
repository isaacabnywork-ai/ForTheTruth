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
    }),
    { name: "ftt-wishlist" }
  )
);
