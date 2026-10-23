"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentlyViewedItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  image?: string;
  author?: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addRecentlyViewed: (item: Omit<RecentlyViewedItem, "viewedAt">) => void;
  clearRecentlyViewed: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      addRecentlyViewed: (item) =>
        set((state) => {
          // Filter out duplicate if already in the list
          const remaining = state.items.filter(
            (i) => i.id !== item.id && i.slug !== item.slug
          );
          // Add newly viewed item to the beginning, limit to 8 recent books
          const updated: RecentlyViewedItem[] = [
            { ...item, viewedAt: Date.now() },
            ...remaining,
          ].slice(0, 8);
          return { items: updated };
        }),
      clearRecentlyViewed: () => set({ items: [] }),
    }),
    { name: "ftt-recently-viewed" }
  )
);
