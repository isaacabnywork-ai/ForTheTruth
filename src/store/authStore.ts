"use client";

import { create } from "zustand";
import type { User } from "@/types/cart";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

/**
 * Client-side mirror of the session for UI (header dropdown, etc.).
 * Source of truth is the Auth.js session (Phase 3) — tokens are NOT stored here.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
