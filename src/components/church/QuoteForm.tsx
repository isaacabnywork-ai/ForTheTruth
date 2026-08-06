"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";

/**
 * Church quote request. Submits to /api/quote, which currently logs the
 * request — connect it to email/CRM when you're ready.
 */
export function QuoteForm() {
  const [form, setForm] = useState({
    churchName: "",
    contactName: "",
    email: "",
    phone: "",
    congregationSize: "",
    needs: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-gold/40 bg-gold/10 p-8">
        <p className="font-display text-xl font-bold text-gold-deep">
          Request received
        </p>
        <p className="mt-2 text-sm text-charcoal/65">
          Thanks — we&apos;ll get back to you within one working day with
          pricing and availability.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-sand bg-offwhite p-7 shadow-card"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Church / organisation"
          required
          value={form.churchName}
          onChange={(e) => set("churchName", e.target.value)}
        />
        <Field
          label="Your name"
          required
          value={form.contactName}
          onChange={(e) => set("contactName", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <Field
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+91…"
        />
      </div>
      <Field
        label="How many people do you serve?"
        value={form.congregationSize}
        onChange={(e) => set("congregationSize", e.target.value)}
        placeholder="e.g. 120 members, 30 in small groups"
      />
      <div>
        <label
          htmlFor="needs"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal/60"
        >
          What do you need?
        </label>
        <textarea
          id="needs"
          required
          rows={4}
          value={form.needs}
          onChange={(e) => set("needs", e.target.value)}
          placeholder="Titles or topics, quantities, and the date you need them by."
          className="w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm placeholder:text-charcoal/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
        />
      </div>

      {status === "error" && (
        <p className="text-sm font-semibold text-red-600">
          Something went wrong. Email us at abnyserver@gmail.com instead.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-cta w-full disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Request Quote"}
      </button>
      <p className="text-center text-[11px] text-charcoal/40">
        No obligation — we reply within one working day.
      </p>
    </form>
  );
}
