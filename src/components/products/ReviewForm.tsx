"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function ReviewForm({ productId }: { productId: number }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<
    { type: "idle" } | { type: "sending" } | { type: "done" } | { type: "error"; message: string }
  >({ type: "idle" });

  if (loading) return null;

  if (!user) {
    return (
      <p className="rounded-xl border border-sand bg-cream/60 p-5 text-sm text-charcoal/60">
        <button
          onClick={() => router.push("/login")}
          className="font-semibold text-gold-dark underline-offset-2 hover:underline"
        >
          Log in
        </button>{" "}
        to write a review.
      </p>
    );
  }

  if (status.type === "done") {
    return (
      <p className="rounded-xl border border-gold/40 bg-gold/10 p-5 text-sm font-semibold text-gold-deep">
        Thank you! Your review was submitted and will appear after moderation.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setStatus({ type: "error", message: "Please pick a star rating" });
      return;
    }
    setStatus({ type: "sending" });
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, review: text }),
    });
    const data = await res.json();
    if (res.ok) setStatus({ type: "done" });
    else setStatus({ type: "error", message: data.error ?? "Could not submit review" });
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-sand bg-white p-6 shadow-card">
      <p className="font-serif text-lg font-bold">Write a review</p>

      <div className="mt-4 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill={star <= (hover || rating) ? "#C89B3C" : "#E6DFD1"}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        minLength={20}
        rows={4}
        placeholder="What did you think of this book? (min 20 characters)"
        className="mt-4 w-full rounded-xl border border-sand bg-cream/50 p-4 text-sm placeholder:text-charcoal/35 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/25"
      />

      {status.type === "error" && (
        <p className="mt-3 text-sm font-semibold text-red-600">{status.message}</p>
      )}

      <button
        type="submit"
        disabled={status.type === "sending"}
        className="btn-gold mt-4 !py-2.5 !text-xs disabled:opacity-60"
      >
        {status.type === "sending" ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
