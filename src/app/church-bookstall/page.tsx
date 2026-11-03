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

const CONFIRM_ITEMS = [
  "Available book titles, quantities and retail prices.",
  "The church's agreed margin or discount arrangement.",
  "Who collects customer payments and when settlement is due.",
  "Delivery charges and dispatch arrangements.",
  "Return window and conditions for eligible unsold books.",
  "How damaged, missing or additional stock is handled.",
  "How to request updates or restocking during the campaign.",
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

      {/* Hero Section (Replaced as shown in Image 3) */}
      <section className="py-16 md:py-24 border-b border-sand">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Heading, description, CTA buttons */}
            <div className="lg:col-span-7">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#1F2937] leading-[1.1]">
                This Christmas, <br />
                <span className="italic font-serif text-[#2D5A46] font-normal">bring Christian books</span> <br />
                to your church.
              </h1>

              <p className="mt-6 text-sm sm:text-base text-[#4B5563] leading-relaxed max-w-xl">
                Help your congregation discover books that encourage faith, strengthen families and point people to Christ. Host a For The Truth bookstall with a curated selection of Christian books on consignment, subject to agreed terms.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D5A46] px-6 py-3.5 font-sans text-sm font-semibold text-white shadow hover:bg-[#234737] transition cursor-pointer"
                >
                  <span>Register your church</span>
                  <span>→</span>
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D1D5DB] bg-[#F3F4F6]/60 px-6 py-3.5 font-sans text-sm font-semibold text-[#374151] hover:bg-[#E5E7EB] transition cursor-pointer"
                >
                  See how it works
                </a>
              </div>

              <p className="mt-8 text-xs text-[#6B7280]">
                For pastors, church administrators and ministry teams across India.
              </p>
            </div>

            {/* Right Column: Quote Card (A Christmas Invitation) */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-sand bg-white p-8 sm:p-10 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#4B5563]">
                  A CHRISTMAS INVITATION
                </span>

                <blockquote className="mt-6">
                  <p className="font-display text-2xl sm:text-3xl text-[#2D5A46] leading-snug">
                    &ldquo;The Word became flesh and made his dwelling among us.&rdquo;
                  </p>
                  <cite className="block mt-4 text-xs font-semibold not-italic text-[#6B7280]">
                    John 1:14
                  </cite>
                </blockquote>

                <div className="mt-8 pt-6 border-t border-sand/70">
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Help your church make thoughtful Christian reading part of the Christmas season.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Clear From The Beginning / Partnership (Replaces previous section as shown in Images 1 & 2) */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            {/* Left: Built on clear communication */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-6 bg-[#2D5A46]"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#2D5A46]">
                  CLEAR FROM THE BEGINNING
                </span>
              </div>

              <h2 className="mt-4 font-display text-4xl sm:text-5xl font-black text-[#1F2937] leading-[1.15]">
                A partnership built <br />
                on clear <br />
                communication.
              </h2>

              <p className="mt-6 text-sm sm:text-base text-[#4B5563] leading-relaxed">
                We want the process to be straightforward for your church team. Before dispatch, a For The Truth representative will explain the terms and answer your questions.
              </p>

              <div className="mt-8">
                <a
                  href="https://wa.me/918604685533?text=Hi%20For%20The%20Truth%2C%20we%20would%20like%20to%20start%20a%20conversation%20about%20a%20Church%20Bookstall."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2D5A46] px-6 py-3.5 font-sans text-sm font-semibold text-white shadow hover:bg-[#234737] transition"
                >
                  <span>Start a conversation</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Right: What we'll confirm together card */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-sand bg-white p-8 sm:p-10 shadow-sm">
                <h3 className="font-display text-2xl font-bold text-[#1F2937]">
                  What we&apos;ll confirm together
                </h3>

                <ul className="mt-6 space-y-3.5 text-sm text-[#4B5563]">
                  {CONFIRM_ITEMS.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-[#2D5A46] font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 rounded-xl bg-[#F4F1EA] p-4 border-l-4 border-[#C89B3C] text-xs text-[#4B5563] leading-relaxed">
                  Registration does not automatically confirm an order. Book availability and the final consignment terms will be confirmed with your church before dispatch.
                </div>
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
