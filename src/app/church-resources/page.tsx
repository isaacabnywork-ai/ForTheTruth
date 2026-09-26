import type { Metadata } from "next";
import Link from "next/link";
import { QuoteForm } from "@/components/church/QuoteForm";
import { CHURCH_TRUST } from "@/utils/constants";

export const metadata: Metadata = {
  title: "Church Resources & Bulk Orders",
  description:
    "Bulk discounts up to 30%, curriculum kits, small-group sets, invoicing and purchase orders for churches, schools, and ministries.",
};

const TIERS = [
  { qty: "1 – 5 copies", discount: "Standard price", note: "" },
  { qty: "6 – 10 copies", discount: "10% off", note: "Applied automatically" },
  { qty: "11 – 25 copies", discount: "20% off", note: "Applied automatically" },
  { qty: "26 – 99 copies", discount: "30% off", note: "Invoicing available" },
  { qty: "100+ copies", discount: "Custom pricing", note: "Request a quote" },
];

const STEPS = [
  { title: "Tell us what you need", body: "Browse kits or send a list — topics, quantities, and your timeline." },
  { title: "Get a quote", body: "We confirm availability and pricing, usually within 24 hours." },
  { title: "Pay your way", body: "Card, UPI, netbanking via Razorpay — or purchase order and invoice." },
  { title: "Delivered", body: "Dispatched in 24 hours; 5–7 business days across India." },
];

const FAQ = [
  { q: "What's the minimum order for a bulk discount?", a: "Discounts start at 6 copies of any combination of titles. Larger orders unlock deeper tiers automatically at checkout." },
  { q: "Do you offer invoicing or purchase orders?", a: "Yes — for churches, schools, and registered ministries. Send your PO with a quote request and we'll invoice your organisation." },
  { q: "How fast can you ship?", a: "Orders dispatch within 24 hours and typically arrive in 5–7 business days. Tell us your event date and we'll confirm feasibility." },
  { q: "Can you build a custom kit?", a: "Absolutely. Share your theme, group size, and budget — we'll propose a set and price it for you." },
];

export default function ChurchResourcesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-gradient py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-light">
            Church Resources
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-display-sm font-black text-white md:text-display-lg">
            Equip your congregation,{" "}
            <em className="text-gradient-gold">affordably</em>
          </h1>
          <p className="mt-5 max-w-xl text-white/65 md:text-lg">
            Bulk discounts up to 30%, ready-made curriculum kits, and invoicing
            for churches, schools, and ministries across India.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="#quote" className="btn-cta">
              Request a Quote
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/25 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-smooth hover:border-gold hover:text-gold-light"
            >
              Browse the Catalog
            </Link>
          </div>

          <dl className="mt-14 grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-3">
            {CHURCH_TRUST.map((t) => (
              <div key={t.title}>
                <dt className="font-display text-lg font-bold text-gold-light">
                  {t.title}
                </dt>
                <dd className="mt-1 text-sm text-white/55">{t.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Pricing tiers */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16 lg:px-8">
        <div className="mb-9">
          <p className="overline-label mb-2">Transparent pricing</p>
          <h2 className="section-title">Bulk discount tiers</h2>
          <p className="mt-3 max-w-xl text-sm text-charcoal/55">
            Discounts apply across your whole order — mix and match titles.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sand bg-cream/60 text-xs uppercase tracking-wider text-charcoal/50">
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Discount</th>
                <th className="hidden px-6 py-4 sm:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/70">
              {TIERS.map((t) => (
                <tr key={t.qty} className="transition-colors hover:bg-cream/40">
                  <td className="px-6 py-4 font-semibold">{t.qty}</td>
                  <td className="px-6 py-4 font-bold text-gold-dark">
                    {t.discount}
                  </td>
                  <td className="hidden px-6 py-4 text-charcoal/55 sm:table-cell">
                    {t.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-charcoal/40">
          Indicative tiers — confirm final pricing on your quote.
        </p>
      </section>

      {/* Kits */}
      <section id="kits" className="scroll-mt-32 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mb-9">
            <p className="overline-label mb-2">Ready to order</p>
            <h2 className="section-title">Popular church sets</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { name: "Small Group Starter", desc: "5 discussion-ready titles with leader notes.", size: "Best for 8–15 people" },
              { name: "Leadership Development", desc: "8 books for pastors, elders, and ministry staff.", size: "Best for 5–20 leaders" },
              { name: "All-Church Read", desc: "One title, congregation-wide, at the deepest tier.", size: "Best for 50+ copies" },
            ].map((kit) => (
              <div
                key={kit.name}
                className="flex flex-col rounded-2xl border border-sand bg-offwhite p-7 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-card-hover"
              >
                <p className="font-display text-lg font-bold text-charcoal">
                  {kit.name}
                </p>
                <p className="mt-2 flex-1 text-sm text-charcoal/60">{kit.desc}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gold-dark">
                  {kit.size}
                </p>
                <Link href="#quote" className="btn-cta mt-6 !py-2.5 !text-xs">
                  Get Pricing
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-charcoal/50">
            Need something specific?{" "}
            <Link href="#quote" className="font-semibold text-gold-dark hover:underline">
              Tell us your theme and group size
            </Link>{" "}
            and we&apos;ll build a custom kit.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16 lg:px-8">
        <div className="mb-9">
          <p className="overline-label mb-2">Simple process</p>
          <h2 className="section-title">How church orders work</h2>
        </div>
        <ol className="grid gap-5 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="rounded-2xl border border-sand bg-white p-6 shadow-card"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-gradient font-display font-bold text-white shadow-gold">
                {i + 1}
              </span>
              <p className="mt-4 font-display font-bold text-charcoal">{s.title}</p>
              <p className="mt-1.5 text-sm text-charcoal/60">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Quote form */}
      <section id="quote" className="scroll-mt-32 bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          <div>
            <p className="overline-label mb-2">No obligation</p>
            <h2 className="section-title">Request a quote</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal/60">
              Tell us about your church and what you need. We&apos;ll come back
              within one working day with pricing, availability, and delivery
              dates.
            </p>
            <div className="mt-8 space-y-3 rounded-2xl border border-sand bg-offwhite p-6">
              <p className="text-sm font-bold text-charcoal">
                Prefer to talk it through?
              </p>
              <p className="text-sm text-charcoal/60">
                Email us at{" "}
                <a
                  href="mailto:contact@forthetruth.in"
                  className="font-semibold text-gold-dark hover:underline"
                >
                  contact@forthetruth.in
                </a>{" "}
                and mention your church name and group size.
              </p>
            </div>
          </div>
          <QuoteForm />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl scroll-mt-32 px-4 py-16 lg:px-8">
        <div className="mb-9 text-center">
          <p className="overline-label mb-2">Questions</p>
          <h2 className="section-title">Church order FAQs</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-sand bg-white p-6 shadow-card"
            >
              <summary className="cursor-pointer list-none font-display font-bold text-charcoal marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {f.q}
                  <span className="text-gold-dark transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/65">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
