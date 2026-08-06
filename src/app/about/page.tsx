import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | For The Truth",
  description: "Learn about For The Truth bookstore — our mission, curated selection of 600+ sound Christian books, and commitment to equipping readers and churches.",
};

const VALUES = [
  {
    title: "Sound Theological Curation",
    description:
      "Every title in our catalog of 600+ books is handpicked for biblical fidelity, spiritual depth, and practical wisdom.",
  },
  {
    title: "Transparent & Honest Pricing",
    description:
      "We keep prices fair and accessible for individual readers, families, and churches across India with automatic bulk discounts.",
  },
  {
    title: "Church & Ministry Partnership",
    description:
      "We equip congregations, small groups, and pastors with curriculum sets, invoicing options, and dedicated support.",
  },
  {
    title: "Fast & Reliable Delivery",
    description:
      "Orders dispatch within 24 hours and are delivered across India with secure Razorpay payment options.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-offwhite min-h-screen">
      {/* Hero Section */}
      <section className="bg-navy-gradient py-16 text-white md:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-light">
            Our Story &amp; Mission
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Books that point to <span className="text-gradient-gold">Truth</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/70 md:text-lg">
            For The Truth is an independent online bookstore dedicated to serving individual readers, families, and local churches with carefully curated Christian literature.
          </p>
        </div>
      </section>

      {/* Main Content & Mission Statement */}
      <section className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <div className="rounded-3xl border border-sand bg-white p-8 shadow-card md:p-12">
          <p className="overline-label mb-3">Why We Exist</p>
          <h2 className="font-display text-2xl font-bold text-charcoal md:text-3xl">
            Equipping readers with stories &amp; theology worth your time
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-charcoal/75">
            <p>
              In a world flooded with shallow content, we believe in the quiet power of a good book. Our mission is to make sound theological literature accessible, affordable, and easily discoverable for believers across India.
            </p>
            <p>
              Whether you are looking for a personal devotional, a rigorous commentary, a small-group discussion guide, or storybooks for your children, every book on our shelves has been vetted to ensure it honors Scripture and builds up the body of Christ.
            </p>
          </div>
        </div>

        {/* Core Values Grid */}
        <div className="mt-16">
          <div className="mb-10 text-center">
            <p className="overline-label">Guiding Principles</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-charcoal">
              What sets us apart
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-sand bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <h3 className="font-display text-lg font-bold text-charcoal">{v.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-charcoal/65">{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-3xl bg-cream p-8 text-center border border-sand/80 shadow-sm md:p-12">
          <h3 className="font-display text-2xl font-bold text-charcoal">
            Ready to explore the library?
          </h3>
          <p className="mt-2 text-xs text-charcoal/60">
            Browse our 600+ handpicked titles or discover resources for your church.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/products" className="btn-gold !px-7 !py-3">
              Browse Catalog
            </Link>
            <Link href="/church-resources" className="btn-navy !px-7 !py-3">
              Church Resources
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
