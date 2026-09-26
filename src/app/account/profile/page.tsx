"use client";

import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { Field } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        firstName: user.firstName,
        lastName: user.lastName,
      }));
    }
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) setUser(data.user);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } else {
      setStatus("error");
    }
  }

  return (
    <AccountShell title="Profile">
      <form
        onSubmit={submit}
        className="max-w-lg space-y-5 rounded-2xl border border-sand bg-white p-8 shadow-card"
      >
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="First name"
            required
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          />
          <Field
            label="Last name"
            required
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          />
        </div>
        <Field label="Email" value={user?.email ?? ""} disabled readOnly />
        <Field
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+91…"
        />
        {status === "error" && (
          <p className="text-sm font-semibold text-red-600">
            Could not save changes. Try again.
          </p>
        )}
        <button
          type="submit"
          disabled={status === "saving"}
          className="btn-gold !py-3 disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save Changes"}
        </button>
        <p className="text-xs text-charcoal/40">
          To change your password, use the “forgot password” flow on the
          WordPress login — a reset link will be emailed to you.
        </p>
      </form>
    </AccountShell>
  );
}
