"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface SearchProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  author?: string | null;
}

interface SelectedBook {
  id: number;
  name: string;
  author?: string | null;
  price?: number;
  quantity: number;
}

const DEFAULT_EVENT_OPTIONS = [
  "Christmas & Advent Celebrations",
  "Regular Sunday Service Table",
  "Annual Church Conference / Camp",
  "Youth Retreat / VBS",
  "Leadership Seminar",
  "Special Ministry Gathering",
  "Other (Specify Below)",
];

export function ChurchBookstallRegistrationForm() {
  const [formData, setFormData] = useState({
    churchName: "",
    cityState: "",
    pastorOrContactName: "",
    role: "Pastor / Senior Leader",
    email: "",
    phone: "",
    eventType: "Christmas & Advent Celebrations",
    customEventType: "",
    bookVolumeDescription: "",
    bookCategories: [] as string[],
    additionalNotes: "",
  });

  // Selected specific books
  const [selectedBooks, setSelectedBooks] = useState<SelectedBook[]>([]);

  // Categories fetched from WooCommerce
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Live book search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Fetch real categories from website
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/church-bookstall/categories");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
        }
      } catch (e) {
        console.warn("Could not fetch categories:", e);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          const items: SearchProduct[] = (data.products || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            image: p.image,
            author: p.author || null,
          }));
          setSearchResults(items);
          setSearchOpen(true);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryToggle = (name: string) => {
    setFormData((prev) => {
      const exists = prev.bookCategories.includes(name);
      return {
        ...prev,
        bookCategories: exists
          ? prev.bookCategories.filter((c) => c !== name)
          : [...prev.bookCategories, name],
      };
    });
  };

  const addBook = (product: SearchProduct) => {
    setSelectedBooks((prev) => {
      const existing = prev.find((b) => b.id === product.id);
      if (existing) {
        return prev.map((b) =>
          b.id === product.id ? { ...b, quantity: b.quantity + 1 } : b
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          author: product.author,
          price: product.price,
          quantity: 1,
        },
      ];
    });
    setSearchQuery("");
    setSearchOpen(false);
  };

  const updateQuantity = (id: number, delta: number) => {
    setSelectedBooks((prev) =>
      prev
        .map((b) => (b.id === id ? { ...b, quantity: Math.max(1, b.quantity + delta) } : b))
        .filter((b) => b.quantity > 0)
    );
  };

  const removeBook = (id: number) => {
    setSelectedBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.churchName.trim() || !formData.pastorOrContactName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError("Please fill in all required contact and church details.");
      return;
    }

    if (!formData.bookVolumeDescription.trim()) {
      setError("Please describe the approximate number or volume of books you would like.");
      return;
    }

    if (formData.eventType === "Other (Specify Below)" && !formData.customEventType.trim()) {
      setError("Please specify your custom event or occasion name.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        churchName: formData.churchName,
        cityState: formData.cityState,
        pastorOrContactName: formData.pastorOrContactName,
        role: formData.role,
        email: formData.email,
        phone: formData.phone,
        eventType: formData.eventType,
        customEventType: formData.customEventType,
        bookVolumeDescription: formData.bookVolumeDescription,
        bookCategories: formData.bookCategories,
        selectedBooks,
        additionalNotes: formData.additionalNotes,
      };

      const res = await fetch("/api/church-bookstall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit registration.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please contact us directly via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 md:p-12 text-center shadow-card">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-3xl font-bold">
          ✓
        </div>
        <h3 className="mt-6 font-display text-2xl font-black text-navy md:text-3xl">
          Registration Received with Gratitude!
        </h3>
        <p className="mx-auto mt-3 max-w-md text-charcoal/70 text-sm leading-relaxed">
          Thank you, <strong className="font-semibold text-charcoal">{formData.pastorOrContactName}</strong>. Our church partnership ministry team will review your book preferences for{" "}
          <strong className="font-semibold text-charcoal">{formData.churchName}</strong> and contact you via WhatsApp / Phone within 24–48 hours to confirm the catalogue selection and delivery.
        </p>

        <div className="mt-8 rounded-2xl bg-cream/40 p-5 text-left border border-sand text-xs text-charcoal/80 space-y-2 max-w-lg mx-auto">
          <p className="font-bold text-navy text-sm">Next Steps in the Consignment Process:</p>
          <p>1. We review your requested categories ({formData.bookCategories.length} selected) and specific titles ({selectedBooks.length} titles requested).</p>
          <p>2. We share the confirmed consignment dispatch list with church margin options.</p>
          <p>3. Books are safely packed and delivered directly to your church address.</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://wa.me/918604685533?text=Hi%20For%20The%20Truth%2C%20we%20just%20submitted%20a%20Church%20Bookstall%20registration%20for%20our%20church."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-emerald-700 transition"
          >
            <span>WhatsApp Us Directly</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setSelectedBooks([]);
            }}
            className="w-full sm:w-auto rounded-xl border border-sand bg-white px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-charcoal/70 hover:bg-cream/40 transition"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-sand bg-white p-6 md:p-10 shadow-card">
      <div className="border-b border-sand pb-6">
        <h3 className="font-display text-2xl font-bold text-navy">
          Step 1: Register Your Church or Ministry Gathering
        </h3>
        <p className="mt-1 text-sm text-charcoal/60">
          Tell us about your church and the books you would like to display. No upfront purchase required.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {/* Church & Location */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
              Church / Ministry Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.churchName}
              onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
              placeholder="e.g. Grace Bible Fellowship"
              className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
              City &amp; State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.cityState}
              onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
              placeholder="e.g. Bengaluru, Karnataka"
              className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>
        </div>

        {/* Contact Person & Role */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
              Contact Person / Pastor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.pastorOrContactName}
              onChange={(e) => setFormData({ ...formData, pastorOrContactName: e.target.value })}
              placeholder="e.g. Pastor David Kumar"
              className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
              Your Ministry Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              <option value="Pastor / Senior Leader">Pastor / Senior Leader</option>
              <option value="Associate / Youth Pastor">Associate / Youth Pastor</option>
              <option value="Church Administrator / Deacon">Church Administrator / Deacon</option>
              <option value="Bookstall / Resource Coordinator">Bookstall / Resource Coordinator</option>
              <option value="Sunday School / Family Ministry">Sunday School / Family Ministry</option>
              <option value="Other Ministry Leader">Other Ministry Leader</option>
            </select>
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="pastor@church.org"
              className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
              Phone / WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>
        </div>

        {/* Gathering / Event Info & Custom Occasion */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
              Event / Occasion <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              {DEFAULT_EVENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {formData.eventType === "Other (Specify Below)" && (
            <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4 animate-in fade-in">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Describe Your Occasion / Gathering <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customEventType}
                onChange={(e) => setFormData({ ...formData, customEventType: e.target.value })}
                placeholder="e.g. Men's Retreat, Marriage Conference, Reformation Sunday..."
                className="w-full rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </div>
          )}
        </div>

        {/* Website Categories Selector */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80">
              Select Categories from Our Bookstore
            </label>
            <span className="text-xs text-charcoal/50">
              {formData.bookCategories.length} selected
            </span>
          </div>
          <p className="text-xs text-charcoal/60 mb-3">
            Choose the themes or genres you would like our team to include in your curated consignment box.
          </p>

          {loadingCategories ? (
            <div className="flex items-center gap-2 py-4 text-xs text-charcoal/50">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              Loading categories from bookstore...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = formData.bookCategories.includes(cat.name);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => handleCategoryToggle(cat.name)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      selected
                        ? "bg-navy text-white shadow-sm ring-1 ring-navy"
                        : "bg-cream/50 text-charcoal/80 border border-sand hover:border-gold hover:bg-white"
                    }`}
                  >
                    {selected ? "✓ " : "+ "}
                    {cat.name}
                    {cat.count > 0 && (
                      <span className={`ml-1.5 text-[10px] ${selected ? "text-white/70" : "text-charcoal/40"}`}>
                        ({cat.count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Book Search Bar & Specific Titles Picker */}
        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1.5">
            Search &amp; Add Specific Books (Optional)
          </label>
          <p className="text-xs text-charcoal/60 mb-3">
            Search our live catalog to request specific titles you would love to have on your table.
          </p>

          <div ref={searchContainerRef} className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setSearchOpen(true);
                }}
                placeholder="Search by book title or author..."
                className="w-full rounded-xl border border-sand bg-cream/30 pl-10 pr-10 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40 text-sm">
                🔍
              </span>
              {searching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              )}
            </div>

            {/* Search Dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-sand bg-white shadow-xl">
                <div className="p-2 divide-y divide-sand/50">
                  {searchResults.map((book) => {
                    const alreadySelected = selectedBooks.some((b) => b.id === book.id);
                    return (
                      <div
                        key={book.id}
                        className="flex items-center justify-between gap-3 p-2.5 hover:bg-cream/40 rounded-xl transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {book.image ? (
                            <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-cream/60">
                              <Image
                                src={book.image}
                                alt={book.name}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-9 flex-shrink-0 rounded bg-cream/60 flex items-center justify-center text-xs text-charcoal/40">
                              📖
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-navy truncate">{book.name}</p>
                            {book.author && (
                              <p className="text-[11px] text-charcoal/60 truncate">by {book.author}</p>
                            )}
                            <p className="text-[11px] font-semibold text-gold mt-0.5">₹{book.price}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => addBook(book)}
                          className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            alreadySelected
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-navy text-white hover:bg-navy/90"
                          }`}
                        >
                          {alreadySelected ? "+ Add Another" : "+ Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Selected Books List */}
          {selectedBooks.length > 0 && (
            <div className="mt-4 rounded-2xl border border-sand bg-cream/20 p-4">
              <div className="flex items-center justify-between mb-3 border-b border-sand pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-navy">
                  Requested Titles ({selectedBooks.length})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBooks([])}
                  className="text-[11px] text-charcoal/50 hover:text-red-600 transition"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-sand/60 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-charcoal truncate">{book.name}</p>
                      {book.author && <p className="text-[11px] text-charcoal/60 truncate">{book.author}</p>}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center rounded-lg border border-sand bg-cream/30">
                        <button
                          type="button"
                          onClick={() => updateQuantity(book.id, -1)}
                          className="px-2 py-1 text-charcoal hover:bg-sand/30 transition rounded-l"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold text-navy text-xs">{book.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(book.id, 1)}
                          className="px-2 py-1 text-charcoal hover:bg-sand/30 transition rounded-r"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeBook(book.id)}
                        className="text-charcoal/40 hover:text-red-600 p-1 transition"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desired Book Volume (Free text description) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
            How Many Books Do You Need? <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.bookVolumeDescription}
            onChange={(e) => setFormData({ ...formData, bookVolumeDescription: e.target.value })}
            placeholder="e.g. Around 40–50 books for 1 table, or 100 books for our multi-service weekend"
            className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          <p className="text-[11px] text-charcoal/50 mt-1.5">
            Describe your rough requirement or table capacity. We will adjust the assortment to fit your space.
          </p>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
            Any Other Special Requests or Questions?
          </label>
          <textarea
            rows={3}
            value={formData.additionalNotes}
            onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
            placeholder="Mention any specific authors, languages (e.g. Hindi/English), or special instructions..."
            className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gold-gradient py-4 font-display text-sm font-bold uppercase tracking-wider text-white shadow-gold hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Submitting Registration…" : "Submit Registration & Request Consignment Catalogue →"}
          </button>
          <p className="mt-3 text-center text-xs text-charcoal/50">
            No upfront payment required. Our ministry team will contact you to finalize titles, quantities, and delivery.
          </p>
        </div>
      </div>
    </form>
  );
}
