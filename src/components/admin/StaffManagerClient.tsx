"use client";

import { useState, useCallback } from "react";

interface StaffUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: string;
  avatarUrl: string;
  isFallback?: boolean;
}

interface Props {
  initialUsers: StaffUser[];
  isFallback: boolean;
  currentUserEmail: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  administrator: { label: "Administrator", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  shop_manager: { label: "Shop Manager", color: "bg-gold/20 text-gold-light border-gold/30" },
  editor: { label: "Editor", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
};

export function StaffManagerClient({ initialUsers, isFallback, currentUserEmail }: Props) {
  const [users, setUsers] = useState<StaffUser[]>(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "shop_manager",
  });

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to create user");
      } else {
        setFormSuccess(`✓ ${form.firstName || form.email} has been added as ${form.role}.`);
        setForm({ email: "", firstName: "", lastName: "", password: "", role: "shop_manager" });
        setShowForm(false);
        // Add the new user to the list optimistically
        setUsers((prev) => [
          ...prev,
          {
            id: data.user.id,
            email: data.user.email,
            firstName: form.firstName,
            lastName: form.lastName,
            displayName: data.user.displayName,
            role: data.user.role,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(form.email)}`,
          },
        ]);
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  const handleDelete = useCallback(async (userId: number, email: string) => {
    if (!confirm(`Remove ${email} from the admin panel? This cannot be undone.`)) return;
    setDeleting(userId);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to remove user");
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeleting(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Staff & Access</h1>
          <p className="mt-1 text-sm text-white/50">
            Manage who can access the admin panel. Changes take effect immediately.
          </p>
        </div>
        <button
          onClick={() => { setShowForm((p) => !p); setFormError(null); setFormSuccess(null); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-dark to-gold px-4 py-2.5 text-sm font-bold text-navy shadow-md transition-all hover:brightness-110 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Staff Member
        </button>
      </div>

      {/* Fallback warning banner */}
      {isFallback && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          <div className="flex items-start gap-3">
            <svg width="20" height="20" className="mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            <div>
              <p className="font-bold">WordPress backend not yet connected</p>
              <p className="mt-1 text-amber-300/80">
                You are using the fallback admin login. You can <strong>view</strong> this panel, but <strong>creating or deleting users</strong> requires your WordPress JWT Authentication plugin to be active. Please activate it on your WordPress site and then log in with your real credentials.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success banner */}
      {formSuccess && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm font-semibold text-emerald-300">
          {formSuccess}
        </div>
      )}

      {/* Add Staff Form */}
      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-4 font-display text-lg font-bold text-white">Add New Staff Member</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/50">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  placeholder="John"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/50">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  placeholder="Doe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/50">Email Address *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="staff@forthetruth.in"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/50">Password *</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/50">Access Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-navy px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
              >
                <option value="shop_manager">Shop Manager — Full store access, no site settings</option>
                <option value="administrator">Administrator — Full access including site settings</option>
                <option value="editor">Editor — Content management only</option>
              </select>
            </div>

            {formError && (
              <p className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-sm font-semibold text-rose-400">
                {formError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-dark to-gold px-5 py-2.5 text-sm font-bold text-navy shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
              >
                {submitting ? (
                  <><span className="animate-spin">⏳</span> Creating…</>
                ) : (
                  <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg> Create Account</>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff List */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4">
          <p className="text-sm font-bold text-white/70">
            {users.length} staff member{users.length !== 1 ? "s" : ""} with admin access
          </p>
        </div>
        <ul className="divide-y divide-white/5">
          {users.map((user) => {
            const roleInfo = ROLE_LABELS[user.role] ?? { label: user.role, color: "bg-white/10 text-white/60 border-white/10" };
            const isCurrentUser = user.email === currentUserEmail;
            return (
              <li key={user.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Avatar */}
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-gold/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`}
                      alt={user.displayName}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Name & email */}
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">
                      {user.displayName || `${user.firstName} ${user.lastName}`.trim() || user.email}
                      {isCurrentUser && (
                        <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold-light">YOU</span>
                      )}
                    </p>
                    <p className="text-xs text-white/50 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Role badge */}
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>

                  {/* Delete button — can't delete yourself */}
                  {!isCurrentUser && !user.isFallback && (
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      disabled={deleting === user.id}
                      title="Remove access"
                      className="rounded-lg p-2 text-white/30 hover:bg-rose-500/10 hover:text-rose-400 transition-colors disabled:opacity-40"
                    >
                      {deleting === user.id ? (
                        <span className="animate-spin text-sm">⏳</span>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      )}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
