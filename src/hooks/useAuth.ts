"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types/cart";

interface AuthResult {
  ok: boolean;
  error?: string;
}

/** Client auth hook — session lives in an httpOnly cookie, this mirrors it. */
export function useAuth() {
  const { user, isAuthenticated, setUser, logout: clearUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { user: User | null };
        if (data.user) setUser(data.user);
        else clearUser();
      } else {
        clearUser();
      }
    } catch {
      clearUser();
    } finally {
      setLoading(false);
    }
  }, [setUser, clearUser]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Login failed" };
      setUser(data.user);
      return { ok: true };
    },
    [setUser]
  );

  const loginWithGoogle = useCallback(
    async (email: string, firstName?: string, lastName?: string, avatarUrl?: string): Promise<AuthResult> => {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Google sign-in failed" };
      setUser(data.user);
      return { ok: true };
    },
    [setUser]
  );

  const register = useCallback(
    async (input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }): Promise<AuthResult> => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok)
        return { ok: false, error: data.error ?? "Registration failed" };
      setUser(data.user);
      return { ok: true };
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearUser();
  }, [clearUser]);

  return { user, isAuthenticated, loading, login, loginWithGoogle, register, logout, refresh };
}
