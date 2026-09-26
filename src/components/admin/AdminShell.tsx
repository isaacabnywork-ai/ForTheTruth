"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { StaffLockScreen } from "./StaffLockScreen";

/**
 * Admin layout with a server-verified gate: on mount we ask
 * /api/admin/session whether the current session is an admin.
 * (The APIs are independently protected — this gate is UX, not security.)
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "locked" | "unlocked">(
    "checking"
  );

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await res.json();
      setState(data.isAdmin ? "unlocked" : "locked");
    } catch {
      setState("locked");
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const handleLock = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setState("locked");
  };

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy text-sm text-white/50">
        Checking admin session…
      </div>
    );
  }

  if (state === "locked") {
    return <StaffLockScreen onUnlock={() => setState("unlocked")} />;
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#F8FAFC] font-sans text-charcoal antialiased lg:flex-row">
      <AdminSidebar onLock={handleLock} />
      <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  );
}
