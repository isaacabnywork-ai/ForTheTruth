"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWishlistStore } from "@/store/wishlistStore";

const DEBOUNCE_MS = 800;

/**
 * Cloud-sync hook for the wishlist.
 *
 * - On mount (when a logged-in user is detected): fetches `/api/wishlist`
 *   and merges the server IDs into local state via `syncFromServer`.
 * - When `productIds` change (after a toggle): debounces 800 ms then
 *   calls `syncToServer` to persist the new list to the server.
 * - No-op for guests — localStorage persistence is unaffected.
 *
 * Usage: call `useWishlistSync()` once at the top of any component that
 * should trigger sync (e.g. ProductDetail, or a layout wrapper).
 */
export function useWishlistSync() {
  const { user, loading } = useAuth();
  const productIds = useWishlistStore((s) => s.productIds);
  const syncFromServer = useWishlistStore((s) => s.syncFromServer);
  const syncToServer = useWishlistStore((s) => s.syncToServer);

  // Track whether the initial server fetch has already been done in this session
  const didFetchRef = useRef(false);

  // On first render once auth is resolved and user is logged in → pull from server
  useEffect(() => {
    if (loading || !user || didFetchRef.current) return;

    didFetchRef.current = true;

    fetch("/api/wishlist", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { productIds: number[] };
        if (Array.isArray(data.productIds) && data.productIds.length > 0) {
          syncFromServer(data.productIds);
        }
      })
      .catch(() => {
        // Best-effort — ignore network failures silently
      });
  }, [loading, user, syncFromServer]);

  // Debounced write-back whenever productIds change (only for logged-in users)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    // Skip the very first tick right after the initial fetch to avoid a
    // redundant write with the just-merged list.
    if (!didFetchRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void syncToServer();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [productIds, loading, user, syncToServer]);
}
