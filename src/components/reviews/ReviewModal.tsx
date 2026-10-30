"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  defaultReviewerName?: string;
  defaultReviewerEmail?: string;
  onSuccess?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  defaultReviewerName = "",
  defaultReviewerEmail = "",
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [name, setName] = useState(defaultReviewerName);
  const [email, setEmail] = useState(defaultReviewerEmail);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating");
      return;
    }
    if (review.trim().length < 3) {
      setError("Please write a few words about your experience");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          review: review.trim(),
          reviewer_name: name.trim() || undefined,
          reviewer_email: email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not submit review");
      }

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-lg rounded-3xl border border-sand bg-white p-6 shadow-2xl sm:p-8 z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full text-charcoal/50 hover:bg-cream hover:text-charcoal transition"
            aria-label="Close"
          >
            ✕
          </button>

          {submitted ? (
            <div className="text-center py-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-charcoal">
                Thank You for Your Review!
              </h3>
              <p className="mt-2 text-sm text-charcoal/70 max-w-sm mx-auto">
                Your feedback on <span className="font-bold text-charcoal">{productName}</span> has been received. Your honest thoughts help other believers discover sound, gospel-rich literature!
              </p>
              <button
                onClick={onClose}
                className="btn-gold mt-6 inline-flex !px-8 !py-3 text-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-dark">
                  Customer Review
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-charcoal">
                  Review &amp; Feedback
                </h3>
                <p className="text-sm font-semibold text-charcoal/80 mt-1 line-clamp-1">
                  {productName}
                </p>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hover || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={rating === star}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-transform hover:scale-115 p-1 focus:outline-none"
                      >
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill={active ? "#C89B3C" : "#E6DFD1"}
                          className="transition-colors"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-bold text-gold-dark">
                    {rating === 5 ? "Excellent ★★★★★" : rating === 4 ? "Very Good ★★★★" : rating === 3 ? "Good ★★★" : rating === 2 ? "Fair ★★" : "Needs Improvement ★"}
                  </span>
                </div>
              </div>

              {/* Review Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-1.5">
                  Your Thoughts &amp; Experience
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  required
                  rows={4}
                  placeholder="How did this book encourage your spiritual growth, deepen your understanding, or impact your reading? What would you tell someone considering this title?"
                  className="w-full rounded-2xl border border-sand bg-cream/40 p-4 text-sm placeholder:text-charcoal/40 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </div>

              {/* Optional Name & Email for guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John D."
                    className="w-full rounded-xl border border-sand bg-cream/40 px-3.5 py-2.5 text-sm placeholder:text-charcoal/40 focus:border-gold focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-sand bg-cream/40 px-3.5 py-2.5 text-sm placeholder:text-charcoal/40 focus:border-gold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-charcoal/60 hover:bg-cream transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold !py-2.5 !px-6 text-sm disabled:opacity-60"
                >
                  {loading ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
