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
  administrator: { label: "Administrator", color: "bg-rose-50 text-rose-600 border-rose-200" },
  shop_manager:  { label: "Shop Manager",  color: "bg-amber-50 text-amber-700 border-amber-200" },
  editor:        { label: "Editor",        color: "bg-blue-50 text-blue-600 border-blue-200" },
};

export function StaffManagerClient({ initialUsers, isFallback, currentUserEmail }: Props) {
  const [users, setUsers]           = useState<StaffUser[]>(initialUsers);
  const [showForm, setShowForm]     = useState(false);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [formError, setFormError]   = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email:     "",
    firstName: "",
    lastName:  "",
    password:  "",
    role:      "shop_manager",
  });

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);
    try {
      const res  = await fetch("/api/admin/staff", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create user");
      } else {
        setFormSuccess(`✓ ${form.firstName || form.email} has been added as ${form.role}.`);
        setForm({ email: "", firstName: "", lastName: "", password: "", role: "shop_manager" });
        setShowForm(false);
        setUsers((prev) => [
          ...prev,
          {
            id: data.user.id,
            email: data.user.email,
            firstName: form.firstName,
            lastName:  form.lastName,
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
      const res  = await fetch("/api/admin/staff", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to remove user");
      else setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeleting(null);
    }
  }, []);

  /* ─── input class helper ─────────────────────────────────────────────────── */
  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Staff &amp; Access</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage who can access the admin panel. Changes take effect immediately.
          </p>
        </div>
        <button
          onClick={() => { setShowForm((p) => !p); setFormError(null); setFormSuccess(null); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M12 5v14M5 12h14"/></svg>
          Add Staff Member
        </button>
      </div>

      {/* ── Fallback Warning ──────────────────────────────────────────────── */}
      {isFallback && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <svg width="20" height="20" className="mt-0.5 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/><path d="M12 17h.01"/>
          </svg>
          <div>
            <p className="font-bold text-amber-900">WordPress backend not yet connected</p>
            <p className="mt-1 text-amber-700">
              You are using the fallback admin login. You can <strong>view</strong> this panel, but{" "}
              <strong>creating or deleting users</strong> requires your WordPress JWT Authentication plugin to be active.
              Please activate it on your WordPress site, then log in with your real admin credentials.
            </p>
          </div>
        </div>
      )}

      {/* ── Success Banner ────────────────────────────────────────────────── */}
      {formSuccess && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-semibold text-emerald-800">
          {formSuccess}
        </div>
      )}

      {/* ── Add Staff Form ────────────────────────────────────────────────── */}
      {showForm && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-display text-lg font-bold text-slate-800">New Staff Member</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">First Name</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="John" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="Doe" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address <span className="text-rose-500">*</span></label>
              <input type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="staff@forthetruth.in" className={inputCls} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Password <span className="text-rose-500">*</span></label>
              <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Minimum 8 characters" className={inputCls} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Access Role <span className="text-rose-500">*</span></label>
              <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className={inputCls}>
                <option value="shop_manager">Shop Manager — Full store access, no site settings</option>
                <option value="administrator">Administrator — Full access including site settings</option>
                <option value="editor">Editor — Content management only</option>
              </select>
            </div>

            {formError && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {formError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-95 disabled:opacity-60">
                {submitting
                  ? <><span className="animate-spin inline-block">⏳</span> Creating…</>
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M12 5v14M5 12h14"/></svg> Create Account</>}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Staff List ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <p className="text-sm font-bold text-slate-700">
            {users.length} staff member{users.length !== 1 ? "s" : ""} with admin access
          </p>
        </div>

        {users.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <svg width="40" height="40" className="mx-auto mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p className="text-sm font-medium">No staff members found</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {users.map((user) => {
              const roleInfo   = ROLE_LABELS[user.role] ?? { label: user.role, color: "bg-slate-100 text-slate-600 border-slate-200" };
              const isCurrentUser = user.email === currentUserEmail;
              const name      = user.displayName || `${user.firstName} ${user.lastName}`.trim() || user.email;
              return (
                <li key={user.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-amber-200 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-semibold text-slate-800 truncate">
                        {name}
                        {isCurrentUser && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Role + delete */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                    {!isCurrentUser && !user.isFallback && (
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={deleting === user.id}
                        title="Remove access"
                        className="rounded-lg p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors disabled:opacity-40"
                      >
                        {deleting === user.id
                          ? <span className="animate-spin text-sm">⏳</span>
                          : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            </svg>
                          )}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Role Guide ───────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Role Guide</p>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">Administrator</span>
            <span>Full site access — orders, products, settings, staff management, POS.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Shop Manager</span>
            <span>Full store access — orders, POS, products, customers. No site settings or staff management.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">Editor</span>
            <span>Content management only — no access to orders or POS.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
