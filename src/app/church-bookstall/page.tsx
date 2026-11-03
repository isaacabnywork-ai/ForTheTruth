import type { Metadata } from "next";
import { ChurchBookstallRegistrationForm } from "@/components/church-bookstall/ChurchBookstallRegistrationForm";
import { ChurchBookstallFAQAccordion } from "@/components/church-bookstall/ChurchBookstallFAQAccordion";

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
    desc: "Tell us about your church and event. We prepare a tailored catalogue matching your congregation.",
    badge: "Free & Fast",
  },
  {
    step: "02",
    title: "Curate Books",
    desc: "Select specific titles or let our team curate a balanced box across kids, parents, and discipleship.",
    badge: "Zero Upfront Cost",
  },
  {
    step: "03",
    title: "Confirm Terms",
    desc: "We agree on dispatch dates, partner margins, and convenient delivery straight to your church address.",
    badge: "Pan-India Courier",
  },
  {
    step: "04",
    title: "Host & Reconcile",
    desc: "Display the books during your gathering, settle payments for books sold, and easily return unsold copies.",
    badge: "Return Unsold",
  },
];

const CURATED_GENERATIONS = [
  {
    tag: "Ages 2–12",
    title: "Children & Early Readers",
    desc: "Storybook Bibles, illustrated big truths, and memory verse devotionals that spark young faith.",
    sample: "The Garden, the Curtain and the Cross · Big Theology for Little Kids",
  },
  {
    tag: "Home & Marriage",
    title: "Families & Parents",
    desc: "Sound guidance on biblical parenting, Christ-centered marriage, and faithful family worship.",
    sample: "Shepherding a Child's Heart · How to Lead Your Family",
  },
  {
    tag: "Foundations",
    title: "New Believers & Discipleship",
    desc: "Clear gospel foundations, prayer life, Christian assurance, and daily growth in grace.",
    sample: "Crucial Questions by R.C. Sproul · One Life · What is Faith?",
  },
  {
    tag: "Leadership",
    title: "Pastors, Elders & Mature Believers",
    desc: "Expository preaching, Reformed theology, biblical counseling, and church history classics.",
    sample: "Preaching Pure and Simple · The Nicene Creed · Expository Exultation",
  },
];

const OCCASIONS = [
  {
    title: "Christmas & Advent Celebrations",
    summary: "Families gift Christmas books, devotionals, and advent reading for the holiday season.",
    tag: "High Demand",
  },
  {
    title: "Sunday Worship Book Tables",
    summary: "A recurring or monthly table fostering continual reading culture in your local congregation.",
    tag: "Ongoing Discipleship",
  },
  {
    title: "Conferences, Camps & Retreats",
    summary: "Study books hand-picked to support guest speaker topics and thematic seminars.",
    tag: "Events",
  },
  {
    title: "VBS & Youth Gatherings",
    summary: "Accessible biblical books and character builders made affordable for young families.",
    tag: "Youth & Kids",
  },
];

const FAQS = [
  {
    q: "How does the consignment model work?",
    a: "Instead of purchasing cartons of books upfront, your church receives a curated stock of books on consignment. You set up a table for church members to browse and buy during your gathering. After the event, you only settle payments for what was sold and return eligible unsold stock according to our simple return terms.",
  },
  {
    q: "Is there any upfront deposit required?",
    a: "No upfront capital is required for recognized churches, pastors, and ministries. Terms and partner margins are mutually agreed upon prior to dispatch.",
  },
  {
    q: "How are unsold books returned?",
    a: "Any unsold copies in clean, resalable condition can simply be packed back into the box. We guide your coordinator through return courier options or arrange doorstep pickups depending on your location.",
  },
  {
    q: "Can we request both English and vernacular titles?",
    a: "Yes. Alongside our main English catalog from Banner of Truth, Crossway, and Reformation Trust, we coordinate Hindi and bilingual titles in partnership with Marg Satya Jeevan.",
  },
  {
    q: "How early should we register before our event?",
    a: "We recommend registering 2 to 3 weeks ahead so our team can coordinate book availability and ensure smooth courier transit across India.",
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
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#F2D082]">
            For Pastors, Administrators &amp; Ministry Teams
          </span>

          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl leading-[1.2] text-white !text-white">
            Equip Your Congregation With a <br className="hidden sm:inline" />
            <span className="text-[#F2D082] !text-[#F2D082]">Church Bookstall on Consignment</span>
          </h1>

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

      {/* Section 1: Why Church Bookstall & When Churches Host */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* Left: Why a Bookstall */}
            <div>
              <p className="overline-label text-gold-dark">Why A Church Bookstall?</p>
              <h2 className="mt-2 font-display text-3xl font-black text-navy sm:text-4xl">
                Helping Your Congregation Build a Christ-Honoring Home Library
              </h2>
              <p className="mt-4 text-sm sm:text-base text-charcoal/70 leading-relaxed">
                Most church members rarely visit Christian bookstores or may not know which authors and theology can be trusted. A temporary church book table puts sound, gospel-centered literature directly into their hands.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-sand bg-white p-4 shadow-sm flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-sm">Zero Capital Risk</h4>
                    <p className="text-xs text-charcoal/65 mt-0.5">
                      No upfront purchase required. Your church only settles for copies sold after the event.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-sand bg-white p-4 shadow-sm flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-sm">Curated For Every Generation</h4>
                    <p className="text-xs text-charcoal/65 mt-0.5">
                      Carefully balanced titles for toddlers, school-age children, parents, and church elders.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-sand bg-white p-4 shadow-sm flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-sm">Simple Stock Returns</h4>
                    <p className="text-xs text-charcoal/65 mt-0.5">
                      Return eligible unsold books in pristine condition according to transparent terms.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: When Churches Host */}
            <div className="rounded-3xl border border-sand bg-white p-6 sm:p-8 shadow-card">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">Ideal Occasions</span>
              <h3 className="mt-1 font-display text-2xl font-bold text-navy">
                When Do Churches Host Bookstalls?
              </h3>

              <div className="mt-6 space-y-3">
                {OCCASIONS.map((occ, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-sand/70 bg-[#FAF8F5] p-4 hover:border-gold/40 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-navy text-sm">{occ.title}</h4>
                      <span className="rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-semibold text-charcoal/70 border border-sand">
                        {occ.tag}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal/65 mt-1.5 leading-snug">
                      {occ.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Step-by-Step Process */}
      <section id="how-it-works" className="bg-white py-16 md:py-20 border-y border-sand">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="overline-label text-gold-dark">Consignment Model</p>
            <h2 className="mt-2 font-display text-3xl font-black text-navy sm:text-4xl">
              How It Works: 4 Simple Steps
            </h2>
            <p className="mt-2 text-sm text-charcoal/60">
              A hassle-free process designed for pastors, church secretaries, and resource coordinators.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((item, idx) => (
              <div
                key={idx}
                className="relative flex flex-col justify-between rounded-3xl border border-sand bg-[#FAF8F5] p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-black text-[#11426B]/25">
                      {item.step}
                    </span>
                    <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-dark">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-base font-bold text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-charcoal/65 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Curated for Every Generation */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="overline-label text-gold-dark">Curated Selections</p>
            <h2 className="mt-2 font-display text-3xl font-black text-navy sm:text-4xl">
              Books for Every Generation in Your Church
            </h2>
            <p className="mt-2 text-sm text-charcoal/60">
              Balanced, faithful literature from trusted publishers (Banner of Truth, Crossway, Reformation Trust, Good Book Company).
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CURATED_GENERATIONS.map((gen, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-sand bg-white p-5 shadow-card hover:border-gold/50 transition flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-dark border border-sand">
                    {gen.tag}
                  </span>
                  <h3 className="mt-3 font-display text-base font-bold text-navy">{gen.title}</h3>
                  <p className="mt-2 text-xs text-charcoal/70 leading-relaxed">{gen.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-sand/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/40">Popular:</span>
                  <p className="text-[11px] text-charcoal/70 mt-1 italic leading-snug">{gen.sample}</p>
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
              Submit your church details below. Choose categories or search specific books from our bookstore catalog.
            </p>
          </div>

          <ChurchBookstallRegistrationForm />
        </div>
      </section>

      {/* Section 5: FAQs & Contact */}
      <section className="bg-white py-16 md:py-20 border-t border-sand">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="overline-label text-gold-dark">Have Questions?</p>
            <h2 className="mt-2 font-display text-3xl font-black text-navy sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Accordion */}
          <ChurchBookstallFAQAccordion items={FAQS} />

          {/* Need help banner with crisp white text */}
          <div className="mt-12 rounded-3xl bg-gradient-to-r from-[#11426B] to-[#0A2942] p-8 sm:p-10 text-center text-white shadow-card">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white !text-white">
              Prefer to talk directly to our team?
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-200">
              We are glad to answer questions, guide book selections, or explain margins for your pastoral team.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://wa.me/918604685533?text=Hi%20For%20The%20Truth%2C%20we%20would%20like%20to%20know%20more%20about%20the%20Church%20Bookstall%20Consignment%20program."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-emerald-700 transition"
              >
                <span>WhatsApp Us: +91 86046 85533</span>
              </a>
              <a
                href="mailto:contact@forthetruth.in?subject=Church%20Bookstall%20Inquiry"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-display text-xs font-semibold normal-case text-white hover:bg-white/15 transition"
              >
                <span>Email: contact@forthetruth.in</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
