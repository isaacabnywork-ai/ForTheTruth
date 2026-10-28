"use client";

import Link from "next/link";

interface CategoriesMegaMenuProps {
  open: boolean;
  onNavigate: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const itemCls =
  "group block rounded-md px-2.5 py-1 text-xs text-charcoal/75 transition-smooth hover:bg-cream hover:text-gold-dark hover:pl-3";
const sectionHeaderCls =
  "font-display text-sm font-bold tracking-normal text-charcoal border-b border-sand pb-1 mb-2.5";
const subHeaderCls =
  "text-[11px] font-semibold tracking-normal text-gold-dark mt-2.5 mb-1 px-2.5";

export function CategoriesMegaMenu({
  open,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: CategoriesMegaMenuProps) {
  return (
    <div
      className={`fixed left-1/2 top-[88px] z-[100] w-[min(1160px,calc(100vw-2rem))] -translate-x-1/2 transition-all duration-300 before:absolute before:-top-5 before:inset-x-0 before:h-5 before:content-[''] ${
        open
          ? "pointer-events-auto visible translate-y-0 opacity-100"
          : "pointer-events-none invisible -translate-y-2 opacity-0"
      }`}
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Column 1: Bible Study & Ministry */}
          <div className="space-y-6">
            <div>
              <p className={sectionHeaderCls}>Bible Study</p>
              <ul className="space-y-0.5">
                <li>
                  <Link href="/categories/bible-study" onClick={onNavigate} className={itemCls}>
                    View All
                  </Link>
                </li>
              </ul>
              <p className={subHeaderCls}>Shop By Series</p>
              <ul className="space-y-0.5">
                <li>
                  <Link href="/categories/bible-commentary" onClick={onNavigate} className={itemCls}>
                    Bible Speaks Today
                  </Link>
                </li>
                <li>
                  <Link href="/categories/good-book-guides" onClick={onNavigate} className={itemCls}>
                    Good Book Guides
                  </Link>
                </li>
                <li>
                  <Link href="/categories/gods-word-for-you-series" onClick={onNavigate} className={itemCls}>
                    God&apos;s Word For You
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className={sectionHeaderCls}>Ministry</p>
              <ul className="space-y-0.5">
                <li>
                  <Link href="/categories/ministry" onClick={onNavigate} className={itemCls}>
                    View All
                  </Link>
                </li>
                <li>
                  <Link href="/categories/church" onClick={onNavigate} className={itemCls}>
                    Church
                  </Link>
                </li>
                <li>
                  <Link href="/categories/missions" onClick={onNavigate} className={itemCls}>
                    Missions
                  </Link>
                </li>
                <li>
                  <Link href="/categories/pastoral" onClick={onNavigate} className={itemCls}>
                    Pastoral
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 2: Children */}
          <div>
            <p className={sectionHeaderCls}>Children</p>
            <ul className="space-y-0.5">
              <li>
                <Link href="/categories/children" onClick={onNavigate} className={itemCls}>
                  View All
                </Link>
              </li>
            </ul>

            <p className={subHeaderCls}>Shop By Age Range</p>
            <ul className="space-y-0.5">
              <li>
                <Link href="/products?category=114&age=424" onClick={onNavigate} className={itemCls}>
                  Age 2–4
                </Link>
              </li>
              <li>
                <Link href="/products?category=114&age=469" onClick={onNavigate} className={itemCls}>
                  Age 2–6
                </Link>
              </li>
              <li>
                <Link href="/products?category=114&age=426" onClick={onNavigate} className={itemCls}>
                  Age 3–6
                </Link>
              </li>
              <li>
                <Link href="/products?category=114&age=423" onClick={onNavigate} className={itemCls}>
                  Age 4–8
                </Link>
              </li>
              <li>
                <Link href="/products?category=114&age=572" onClick={onNavigate} className={itemCls}>
                  Age 14–18
                </Link>
              </li>
            </ul>

            <p className={subHeaderCls}>Shop By Series</p>
            <ul className="space-y-0.5">
              <li>
                <Link href="/categories/biography" onClick={onNavigate} className={itemCls}>
                  Ten Boys &amp; Ten Girls Series
                </Link>
              </li>
              <li>
                <Link href="/categories/a-child-should-know" onClick={onNavigate} className={itemCls}>
                  A Child Should Know
                </Link>
              </li>
              <li>
                <Link href="/categories/do-great-things-for-god" onClick={onNavigate} className={itemCls}>
                  Do Great Things For God
                </Link>
              </li>
              <li>
                <Link href="/categories/minor-prophets" onClick={onNavigate} className={itemCls}>
                  Minor Prophets
                </Link>
              </li>
              <li>
                <Link href="/categories/part-of-the-very-best-bible-stories-series" onClick={onNavigate} className={itemCls}>
                  Part of the Very Best Bible Stories Series
                </Link>
              </li>
              <li>
                <Link href="/categories/tales-that-tell-the-truth" onClick={onNavigate} className={itemCls}>
                  Tales That Tell the Truth
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Christian Living */}
          <div>
            <p className={sectionHeaderCls}>Christian Living</p>
            <ul className="space-y-0.5">
              <li>
                <Link href="/categories/christian-living" onClick={onNavigate} className={itemCls}>
                  View All
                </Link>
              </li>
              <li>
                <Link href="/categories/apologetics" onClick={onNavigate} className={itemCls}>
                  Apologetics &amp; Evangelism
                </Link>
              </li>
              <li>
                <Link href="/categories/counselling" onClick={onNavigate} className={itemCls}>
                  Counselling
                </Link>
              </li>
              <li>
                <Link href="/categories/devotional" onClick={onNavigate} className={itemCls}>
                  Devotional
                </Link>
              </li>
              <li>
                <Link href="/categories/marriage-family" onClick={onNavigate} className={itemCls}>
                  Marriage
                </Link>
              </li>
              <li>
                <Link href="/categories/prayer" onClick={onNavigate} className={itemCls}>
                  Prayer
                </Link>
              </li>
              <li>
                <Link href="/categories/parenting" onClick={onNavigate} className={itemCls}>
                  Parenting
                </Link>
              </li>
              <li>
                <Link href="/products?category=112&orderby=popularity" onClick={onNavigate} className={itemCls}>
                  Shop By Series
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Theology & Upcoming */}
          <div className="space-y-6">
            <div>
              <p className={sectionHeaderCls}>Theology</p>
              <ul className="space-y-0.5">
                <li>
                  <Link href="/categories/theology" onClick={onNavigate} className={itemCls}>
                    View All
                  </Link>
                </li>
              </ul>
              <p className={subHeaderCls}>Shop By Series</p>
              <ul className="space-y-0.5">
                <li>
                  <Link href="/categories/biblical-theology" onClick={onNavigate} className={itemCls}>
                    Short Studies in Biblical Theology
                  </Link>
                </li>
                <li>
                  <Link href="/categories/systematic-theology" onClick={onNavigate} className={itemCls}>
                    Short Studies in Systematic Theology
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className={sectionHeaderCls}>Upcoming</p>
              <ul className="space-y-0.5">
                <li>
                  <Link href="/products?availability=outofstock" onClick={onNavigate} className={itemCls}>
                    Upcoming Titles →
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-sand/30 p-3.5 border border-sand/50">
              <p className="text-[11px] font-semibold text-charcoal/50 mb-1">
                Browse Full Catalog
              </p>
              <Link
                href="/categories"
                onClick={onNavigate}
                className="text-xs font-bold text-gold-dark hover:underline flex items-center gap-1"
              >
                All 50+ Categories <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
