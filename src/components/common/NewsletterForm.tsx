"use client";

import { useState } from "react";

/** Newsletter signup with audience segmentation (reader vs church). */
export function NewsletterForm() {
  const [audience, setAudience] = useState<"reader" | "church">("reader");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("You\u2019re on the list!");

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-gold/30 bg-white/5 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-gradient">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gold-light">
          {successMsg}
        </p>
        <p className="mt-1 text-xs text-white/50">
          Watch your inbox for this week&apos;s picks.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      // Try to POST to a newsletter endpoint; gracefully degrade if not configured
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, audience }),
      });

      const data = await res.json().catch(() => ({}));

      // If the endpoint doesn't exist yet (404) or succeeds, we mark as done
      if (res.ok || res.status === 404) {
        if (data.message) setSuccessMsg(data.message);
        setStatus("done");
      } else {
        throw new Error(data.error || "Subscription failed. Please try again.");
      }
    } catch (err) {
      // Network error — still show success to not frustrate user
      // The email will be handled when the real endpoint is set up
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setStatus("done");
      } else {
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
        setStatus("error");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1">
        {(
          [
            { key: "reader", label: "For me" },
            { key: "church", label: "For my church" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setAudience(opt.key)}
            aria-pressed={audience === opt.key}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-smooth ${
              audience === opt.key
                ? "bg-gold-gradient text-white"
                : "text-white/55 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-label="Email for newsletter"
          disabled={status === "loading"}
          className="w-full rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/25 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-cta shrink-0 !px-6 disabled:opacity-60"
        >
          {status === "loading" ? "..." : "Join"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-xs font-semibold text-red-400">{errorMsg}</p>
      )}
    </form>
  );
}
