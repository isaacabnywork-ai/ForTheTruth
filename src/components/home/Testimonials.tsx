"use client";

import { useEffect, useRef, useState } from "react";
import { RatingStars } from "@/components/products/RatingStars";
import type { TestimonialItem } from "@/types/curation";
import { DEFAULT_REVIEWS } from "@/types/curation";

export function Testimonials({
  reviews = DEFAULT_REVIEWS,
}: {
  reviews?: TestimonialItem[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const list = reviews && reviews.length > 0 ? reviews : DEFAULT_REVIEWS;
  const count = list.length;

  // Auto-advance slider every 4.5 seconds unless paused by mouse hover
  useEffect(() => {
    if (count <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, 4500);
    return () => clearInterval(timer);
  }, [count, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % count);
  };

  // Get three consecutive reviews to show starting at currentIndex
  const getVisibleReviews = () => {
    if (count <= 3) return list;
    const visible: TestimonialItem[] = [];
    for (let i = 0; i < 3; i++) {
      visible.push(list[(currentIndex + i) % count]);
    }
    return visible;
  };

  const visibleReviews = getVisibleReviews();

  return (
    <section
      className="mx-auto max-w-6xl px-4 py-16 lg:px-8 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mb-10 text-center">
        <p className="overline-label">Trusted by readers across India</p>
        <h2 className="section-title mt-2">What people say</h2>
      </div>

      {/* Slider Carousel Container */}
      <div className="relative">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-all duration-500 ease-out"
          onTouchStart={(e) => {
            touchStartXRef.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartXRef.current === null) return;
            const diff = touchStartXRef.current - e.changedTouches[0].clientX;
            if (diff > 50) handleNext();
            else if (diff < -50) handlePrev();
            touchStartXRef.current = null;
          }}
        >
          {visibleReviews.map((t, idx) => (
            <figure
              key={`${t.id || t.name}-${currentIndex}-${idx}`}
              className="flex flex-col justify-between rounded-2xl border border-sand bg-white p-6 shadow-card hover:shadow-card-hover transition-all duration-300 min-h-[220px]"
            >
              <div>
                <RatingStars rating={t.rating || 5} />
                <blockquote className="mt-4 text-sm leading-relaxed text-charcoal/80 font-normal">
                  “{t.quote}”
                </blockquote>
              </div>
              <figcaption className="mt-5 border-t border-sand/70 pt-4 flex items-center justify-between">
                <div>
                  <span className="block text-sm font-bold text-charcoal font-display">
                    {t.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-charcoal/50 font-medium">
                    {t.role}
                  </span>
                </div>
                {t.audience === "church" && (
                  <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">
                    Church
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Navigation Arrows (Visible if more than 3 reviews) */}
        {count > 3 && (
          <div className="hidden sm:flex items-center justify-between pointer-events-none absolute inset-y-1/2 -left-4 -right-4 -translate-y-1/2 z-10">
            <button
              onClick={handlePrev}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-charcoal shadow-md border border-sand/80 hover:bg-gold hover:text-white transition-all duration-200 cursor-pointer"
              aria-label="Previous review"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-charcoal shadow-md border border-sand/80 hover:bg-gold hover:text-white transition-all duration-200 cursor-pointer"
              aria-label="Next review"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Pagination Dots indicator */}
      {count > 3 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentIndex
                  ? "w-6 bg-gold"
                  : "w-2 bg-sand/80 hover:bg-gold/50"
              }`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
