"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const BOOK_CATEGORIES = [
  { id: "children", label: "Children & Illustrated Books", desc: "Big Theology for Little Kids, storybook Bibles, devotional adventures" },
  { id: "family", label: "Family, Marriage & Parenting", desc: "Biblical parenting, Christ-centered marriage, family worship" },
  { id: "new_believers", label: "New Believers & Discipleship", desc: "Foundational Christian living, gospel basics, assurance of salvation" },
  { id: "theology", label: "Sound Theology & Reformed Heritage", desc: "Doctrines of grace, church history, confessions, systematic theology" },
  { id: "pastoral", label: "Pastoral, Leadership & Preaching", desc: "Expository preaching, eldership, biblical counseling, church health" },
  { id: "evangelism", label: "Evangelism & Apologetics", desc: "Defending the faith, gospel tracts, comparative worldviews" },
  { id: "christmas", label: "Christmas & Seasonal Resources", desc: "Advent devotionals, gift editions, Christmas evangelistic booklets" },
];

export function ChurchBookstallRegistrationForm() {
  const [formData, setFormData] = useState({
    churchName: "",
    cityState: "",
    pastorOrContactName: "",
    role: "Pastor / Senior Leader",
    email: "",
    phone: "",
    congregationSize: "100–300",
    eventType: "Sunday Worship Services",
    eventDate: "",
    bookCategories: ["children", "family", "theology"] as string[],
    estimatedBudgetOrVolume: "50–100 books",
    additionalNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleCategoryToggle = (id: string) => {
    setFormData((prev) => {
      const exists = prev.bookCategories.includes(id);
      return {
        ...prev,
        bookCategories: exists
          ? prev.bookCategories.filter((c) => c !== id)
          : [...prev.bookCategories, id],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.churchName.trim() || !formData.pastorOrContactName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError("Please fill in all required contact and church details.");
      return;
    }

    if (formData.bookCategories.length === 0) {
      setError("Please select at least one book category of interest.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/church-bookstall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-3xl">
          ✓
        </div>
        <h3 className="mt-6 font-display text-2xl font-black text-navy md:text-3xl">
          Registration Received with Gratitude!
        </h3>
        <p className="mx-auto mt-3 max-w-md text-charcoal/70 text-sm leading-relaxed">
          Thank you, <strong className="font-semibold text-charcoal">{formData.pastorOrContactName}</strong>. Our church partnership ministry team will review your requirements for{" "}
          <strong className="font-semibold text-charcoal">{formData.churchName}</strong> and contact you via WhatsApp / Phone within 24–48 hours to finalize catalogue selection and terms.
        </p>

        <div className="mt-8 rounded-2xl bg-cream/40 p-5 text-left border border-sand text-xs text-charcoal/80 space-y-2">
          <p><strong>Next Steps:</strong></p>
          <p>1. We will share a tailored consignment book catalogue with special church margins.</p>
          <p>2. You review and approve the curated selection and book counts.</p>
          <p>3. We dispatch the package securely across India with tracking details.</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://wa.me/918604685533?text=Hi%20For%20The%20Truth%2C%20we%20just%20submitted%20a%20Church%20Bookstall%20registration%20for%20our%20church."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-emerald-700 transition"
          >
            <span>💬</span> Message Us on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
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
          Tell us about your congregation, planned dates, and reading needs so we can tailor the ideal consignment arrangement.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
          ⚠️ {error}
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
              <option value="Women's / Sunday School Coordinator">Women&apos;s / Sunday School Coordinator</option>
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

        {/* Gathering / Event Info */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
              Congregation Size <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.congregationSize}
              onChange={(e) => setFormData({ ...formData, congregationSize: e.target.value })}
              className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              <option value="Under 50">Under 50 people</option>
              <option value="50–100">50–100 people</option>
              <option value="100–300">100–300 people</option>
              <option value="300–700">300–700 people</option>
              <option value="700+">700+ people</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
              Event / Occasion <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              <option value="Christmas & Advent Services">Christmas &amp; Advent Services</option>
              <option value="Regular Sunday Service Table">Regular Sunday Service Table</option>
              <option value="Annual Church Conference / Camp">Annual Church Conference / Camp</option>
              <option value="Youth Retreat / VBS">Youth Retreat / VBS</option>
              <option value="Leadership Seminar">Leadership Seminar</option>
              <option value="Special Ministry Gathering">Special Ministry Gathering</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
              Event Date / Period <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              placeholder="e.g. Dec 15–25, 2026"
              className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>
        </div>

        {/* Book Categories Needed */}
        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-3">
            Target Generations &amp; Categories Desired <span className="text-red-500">*</span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {BOOK_CATEGORIES.map((cat) => {
              const selected = formData.bookCategories.includes(cat.id);
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    selected
                      ? "border-gold bg-gold/5 ring-2 ring-gold/40 shadow-sm"
                      : "border-sand bg-cream/20 hover:border-gold/50 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {}} // Handled by div click
                      className="mt-1 h-4 w-4 accent-[#C89B3C]"
                    />
                    <div>
                      <p className="text-sm font-bold text-navy">{cat.label}</p>
                      <p className="text-xs text-charcoal/60 mt-0.5 leading-snug">{cat.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desired Quantity & Notes */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
              Estimated Book Volume Desired
            </label>
            <select
              value={formData.estimatedBudgetOrVolume}
              onChange={(e) => setFormData({ ...formData, estimatedBudgetOrVolume: e.target.value })}
              className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              <option value="25–50 books (Single Table / Small Church)">25–50 books (Single Table / Small Church)</option>
              <option value="50–100 books (Medium Church / Christmas Table)">50–100 books (Medium Church / Christmas Table)</option>
              <option value="100–250 books (Large Congregation / Multi-Day Event)">100–250 books (Large Congregation / Multi-Day Event)</option>
              <option value="250+ books (State / Citywide Conference)">250+ books (State / Citywide Conference)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">
              Specific Titles or Custom Requests
            </label>
            <input
              type="text"
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="e.g. Need Hindi/English bilingual titles, children bibles, etc."
              className="w-full rounded-xl border border-sand bg-cream/30 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gold-gradient py-4 font-display text-sm font-bold uppercase tracking-wider text-white shadow-gold hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60"
          >
            {loading ? "Submitting Registration…" : "Submit Registration & Request Consignment Catalogue →"}
          </button>
          <p className="mt-3 text-center text-xs text-charcoal/50">
            🔒 No upfront payment required. Our partnership coordinator will follow up with pricing margins and catalogue details.
          </p>
        </div>
      </div>
    </form>
  );
}
