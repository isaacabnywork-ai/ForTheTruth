import type { Metadata } from "next";
import Link from "next/link";
import { ChurchBookstallRegistrationForm } from "@/components/church-bookstall/ChurchBookstallRegistrationForm";

export const metadata: Metadata = {
  title: "Church Bookstall Program — Host a Christian Book Table at Your Church",
  description:
    "Set up a temporary Christian bookstall or table at your church for Christmas programs, Sunday services, or ministry gatherings on consignment. No upfront cost, return unsold books.",
  alternates: {
    canonical: "/church-bookstall",
  },
  openGraph: {
    title: "Church Bookstall Program — For The Truth",
    description:
      "Host a sound Christian literature table at your church on consignment. Browse curated books across all generations without upfront financial burden.",
    url: "https://forthetruth.in/church-bookstall",
    siteName: "For The Truth",
    locale: "en_IN",
    type: "website",
  },
};

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Register Your Church",
    desc: "Fill out the simple registration form detailing your church name, congregation size, and upcoming event dates (such as Christmas programs or regular Sunday tables).",
    badge: "Fast & Free",
  },
  {
    step: "02",
    title: "Choose Curated Books",
    desc: "Review our comprehensive catalogue covering Children's illustrated theology, family & parenting resources, discipleship classics, and pastoral works. Pick titles and quantities suited for your flock.",
    badge: "All Generations",
  },
  {
    step: "03",
    title: "Agree on Consignment Terms",
    desc: "Confirm friendly church discounts/margins, delivery schedules, and clear return conditions with our ministry coordination team. No upfront purchase required.",
    badge: "Zero Upfront Cost",
  },
  {
    step: "04",
    title: "Host & Reconcile",
    desc: "Receive the books securely, set up your display table for church members, settle payments only for the books sold, and easily return any eligible unsold stock.",
    badge: "Hassle-Free Return",
  },
];

const CURATED_GENERATIONS = [
  {
    title: "Children & Early Readers",
    icon: "🎨",
    desc: "Illustrated big-truth theology, storybook Bibles, memory verse resources, and engaging character builders that captivate young minds.",
    sample: "The Garden, the Curtain and the Cross, Big Theology for Little Kids",
  },
  {
    title: "Families & Parents",
    icon: "🏡",
    desc: "Sound guidance on biblical parenting, Christ-centered marriage, family devotional time, and cultivating godliness at home.",
    sample: "Shepherding a Child's Heart, How to Lead Your Family, Marriage Guidance",
  },
  {
    title: "New Believers & Discipleship",
    icon: "🌱",
    desc: "Clear gospel foundations, prayer life, Christian assurance, understanding the local church, and growing in grace day by day.",
    sample: "Crucial Questions booklets by R.C. Sproul, One Life, What is Faith?",
  },
  {
    title: "Leaders, Pastors & Mature Believers",
    icon: "📖",
    desc: "In-depth expository works, Reformed theology, biblical counseling, church history, and devotional classics by trusted writers.",
    sample: "Preaching Pure and Simple, The Nicene Creed, Expository Exultation",
  },
];

const FAQS = [
  {
    q: "How does the consignment model work?",
    a: "Instead of buying cartons of books upfront, your church receives a curated stock of books for your event. You display them on a table for church members to browse and buy. After the event, you only pay for what was sold and return eligible unsold books according to the agreed terms.",
  },
  {
    q: "Is there any upfront deposit required?",
    a: "We work directly with recognized local churches, pastors, and registered ministries across India. In most cases, established church arrangements require no upfront payment. Terms are mutually confirmed before dispatch.",
  },
  {
    q: "How are unsold books returned?",
    a: "Unsold books in pristine, resalable condition can be packed and returned to our facility. We guide you through courier options or arrange pickups depending on your location.",
  },
  {
    q: "Can we request both English and vernacular titles?",
    a: "Yes! While our primary catalog is sound English literature, we also coordinate bilingual and Hindi resources (in partnership with Marg Satya Jeevan) upon request.",
  },
  {
    q: "How early should we register before our event?",
    a: "We recommend registering 2 to 3 weeks before your planned church event or Sunday service so we can ship the books with sufficient buffer for courier transit across India.",
  },
];

export default function ChurchBookstallPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forthetruth.in";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Church Bookstall Program",
        item: `${baseUrl}/church-bookstall`,
      },
    ],
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#11426B] to-[#0A2942] py-20 text-white lg:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C89B3C_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#F2D082]">
            <span>🏛️</span> For Pastors, Administrators &amp; Ministry Teams
          </span>

          <h1 className="mt-6 font-display text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-[1.15]">
            Equip Your Congregation With a <br className="hidden sm:inline" />
            <span className="text-[#F2D082]">Church Bookstall on Consignment</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-200">
            Set up an engaging, faithful Christian book table at your church during Sunday services, Christmas gatherings, conferences, or retreats. Zero upfront financial burden — pay only for what you sell.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gold-gradient px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-white shadow-gold hover:opacity-95 transition active:scale-95"
            >
              <span>Register Your Church Bookstall</span>
              <span>↓</span>
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-white backdrop-blur hover:bg-white/15 transition"
            >
              See How It Works
            </a>
          </div>

          {/* Quick Metrics / Key Highlights */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-white/15 pt-8 text-center">
            <div>
              <p className="font-display text-2xl font-black text-[#F2D082]">₹0</p>
              <p className="text-xs text-slate-300 mt-1">Upfront Book Purchase</p>
            </div>
            <div>
              <p className="font-display text-2xl font-black text-[#F2D082]">100%</p>
              <p className="text-xs text-slate-300 mt-1">Biblically Sound Literature</p>
            </div>
            <div>
              <p className="font-display text-2xl font-black text-[#F2D082]">Pan-India</p>
              <p className="text-xs text-slate-300 mt-1">Secure Courier Delivery</p>
            </div>
            <div>
              <p className="font-display text-2xl font-black text-[#F2D082]">Consignment</p>
              <p className="text-xs text-slate-300 mt-1">Return Unsold Stock</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: The Problem & The Consignment Solution */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="overline-label text-gold-dark">Why A Church Bookstall?</p>
              <h2 className="mt-2 font-display text-3xl font-black text-navy sm:text-4xl">
                Helping Your Congregation Build a Christ-Honoring Home Library
              </h2>
              <p className="mt-4 text-base text-charcoal/70 leading-relaxed">
                Most church members rarely visit Christian bookstores or may not know which authors and theology can be trusted. A temporary church book table puts sound, gospel-centered literature directly into their hands before and after worship gatherings.
              </p>
              <p className="mt-4 text-base text-charcoal/70 leading-relaxed">
                Through our <strong>Consignment Arrangement</strong>, your church leadership doesn&apos;t have to tie up scarce church funds in book inventory:
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-sm">No Upfront Capital Risk</h4>
                    <p className="text-xs text-charcoal/60 mt-0.5">You don&apos;t purchase the stock outright; settle sales after your event completes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-sm">Curated Specifically for Generations</h4>
                    <p className="text-xs text-charcoal/60 mt-0.5">Balanced selections for toddlers, school-age kids, teenagers, parents, and church elders.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-sm">Return Unsold Copies</h4>
                    <p className="text-xs text-charcoal/60 mt-0.5">Return eligible unsold books in good condition according to simple, transparent terms.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-sand bg-white p-6 sm:p-8 shadow-card">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">Ideal Church Occasions</span>
              <h3 className="mt-1 font-display text-2xl font-bold text-navy">
                When Do Churches Host Bookstalls?
              </h3>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-sand/70 bg-[#FAF8F5] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎄</span>
                    <div>
                      <h4 className="font-bold text-charcoal text-sm">Christmas &amp; Advent Celebrations</h4>
                      <p className="text-xs text-charcoal/60 mt-0.5">Families buy Christmas books for kids, devotionals, and gift copies for relatives.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-sand/70 bg-[#FAF8F5] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⛪</span>
                    <div>
                      <h4 className="font-bold text-charcoal text-sm">Monthly or Seasonal Sunday Service Tables</h4>
                      <p className="text-xs text-charcoal/60 mt-0.5">Encourage ongoing discipleship and personal devotions across the congregation.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-sand/70 bg-[#FAF8F5] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏕️</span>
                    <div>
                      <h4 className="font-bold text-charcoal text-sm">Conferences, Retreats &amp; Camps</h4>
                      <p className="text-xs text-charcoal/60 mt-0.5">Provide relevant study books tied to the conference theme or guest speaker topics.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-sand/70 bg-[#FAF8F5] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👶</span>
                    <div>
                      <h4 className="font-bold text-charcoal text-sm">VBS, Youth Retreats &amp; Sunday School</h4>
                      <p className="text-xs text-charcoal/60 mt-0.5">Help parents invest in biblical truth for their children at affordable prices.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Step-by-Step Process */}
      <section id="how-it-works" className="bg-white py-16 md:py-24 border-y border-sand">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="overline-label text-gold-dark">Consignment Model</p>
            <h2 className="mt-2 font-display text-3xl font-black text-navy sm:text-4xl">
              How It Works: 4 Simple Steps
            </h2>
            <p className="mt-3 text-sm text-charcoal/60">
              We make the setup seamless and stress-free for pastors, secretaries, and volunteer coordinators.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((item, idx) => (
              <div
                key={idx}
                className="relative flex flex-col justify-between rounded-3xl border border-sand bg-[#FAF8F5] p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-4xl font-black text-[#11426B]/20">
                      {item.step}
                    </span>
                    <span className="rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-dark">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-charcoal/70 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Curated for Every Generation */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="overline-label text-gold-dark">Carefully Selected Selections</p>
            <h2 className="mt-2 font-display text-3xl font-black text-navy sm:text-4xl">
              Books for Every Generation in Your Church
            </h2>
            <p className="mt-3 text-sm text-charcoal/60">
              We curate balanced, cross-generational titles from faithful publishers (Banner of Truth, Crossway, Reformation Trust, Good Book Company, and Indian editions).
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CURATED_GENERATIONS.map((gen, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-sand bg-white p-6 shadow-card hover:border-gold/50 transition"
              >
                <div className="text-3xl mb-3">{gen.icon}</div>
                <h3 className="font-display text-lg font-bold text-navy">{gen.title}</h3>
                <p className="mt-2 text-xs text-charcoal/70 leading-relaxed">{gen.desc}</p>
                <div className="mt-4 pt-4 border-t border-sand/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark">Popular Examples:</span>
                  <p className="text-[11px] text-charcoal/60 mt-1 italic leading-snug">{gen.sample}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Registration Form Section */}
      <section id="register" className="bg-cream/30 py-16 md:py-24 border-t border-sand">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block rounded-full bg-[#11426B]/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#11426B]">
              Registration &amp; Consultation
            </span>
            <h2 className="mt-3 font-display text-3xl font-black text-navy sm:text-4xl">
              Set Up Your Church Bookstall
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-charcoal/70">
              Submit your church details below. Our ministry coordinator will contact you directly on WhatsApp or phone with a tailored catalogue and terms.
            </p>
          </div>

          <ChurchBookstallRegistrationForm />
        </div>
      </section>

      {/* Section 5: FAQs */}
      <section className="bg-white py-16 md:py-24 border-t border-sand">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="overline-label text-gold-dark">Have Questions?</p>
            <h2 className="mt-2 font-display text-3xl font-black text-navy">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-sand bg-[#FAF8F5] p-5 shadow-sm">
                <h3 className="font-bold text-navy text-base">{faq.q}</h3>
                <p className="mt-2 text-xs text-charcoal/70 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Need help or custom arrangement */}
          <div className="mt-12 rounded-3xl bg-navy-gradient p-8 text-center text-white shadow-card">
            <h3 className="font-display text-2xl font-bold">Prefer to talk directly to our team?</h3>
            <p className="mt-2 text-sm text-slate-200">
              We are glad to answer questions, guide book selections, or explain margins for your elders board.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://wa.me/918604685533?text=Hi%20For%20The%20Truth%2C%20we%20would%20like%20to%20know%20more%20about%20the%20Church%20Bookstall%20Consignment%20program."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-emerald-700 transition"
              >
                <span>💬</span> WhatsApp Us: +91 86046 85533
              </a>
              <a
                href="mailto:contact@forthetruth.in?subject=Church%20Bookstall%20Inquiry"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white/15 transition"
              >
                <span>✉️</span> Email: contact@forthetruth.in
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
