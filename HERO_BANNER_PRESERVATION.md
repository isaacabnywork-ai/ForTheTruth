# Hero Banner Section Preservation & Restoration Guide

This document preserves the original standard Hero Banner section of **For The Truth** while the **Christmas Sale Banner** is active.

---

## 1. Preserved Default Hero Section Snapshot

Before switching to the Christmas Sale Banner, the hero section had the following configuration:

- **Component**: `src/components/home/HeroShelf.tsx` (Preserved copy in `src/components/home/DefaultHeroShelf.tsx`)
- **Main Heading**: "Buy Christian Books Online in India for Spiritual Growth"
- **Overline Badge**: `""` (Empty default)
- **Subtitle**: `""` (Empty default)
- **CTAs**:
  - Primary: `Start Browsing ↗` (`/shop`)
  - Secondary: `Bestsellers` (`/shop?orderby=popularity`)
- **Trust Badges**:
  - `✓ Free Shipping over ₹150`
  - `✓ Verified Reader Reviews`
- **Featured Books (in order)**:
  1. **#47592**: *Freedom from Sin's Dominion* — John Owen (₹249, Regular ₹499)
  2. **#46237**: *Holiness* — J.C. Ryle (₹399, Regular ₹699)
  3. **#48904**: *The Big Picture Story Bible [Hardback]* — David Helm (₹999, Regular ₹1499)
  4. **#56886**: *Morning and Evening* — Charles Spurgeon (₹599, Regular ₹899)

---

## 2. Where the Preserved Files Are Located

1. **Standalone Component**: [`src/components/home/DefaultHeroShelf.tsx`](file:///Users/abny/Desktop/FOR%20THE%20TRUTH/src/components/home/DefaultHeroShelf.tsx)
2. **Original Component**: [`src/components/home/HeroShelf.tsx`](file:///Users/abny/Desktop/FOR%20THE%20TRUTH/src/components/home/HeroShelf.tsx)
3. **Configuration Backup**: [`src/config/curated_shelves.default_hero.json`](file:///Users/abny/Desktop/FOR%20THE%20TRUTH/src/config/curated_shelves.default_hero.json)

---

## 3. How to Restore the Original Banner Once Christmas Ends

Restoring the original hero banner takes **under 10 seconds**:

### Method 1: Toggle in `src/app/page.tsx` (Recommended)
Open `src/app/page.tsx` and change line 20:
```typescript
// Change this line:
const SHOW_CHRISTMAS_HERO = true;

// To:
const SHOW_CHRISTMAS_HERO = false;
```
That's it! Next.js will instantly render the preserved standard `HeroShelf` with the original books.

### Method 2: In JSX (Alternative)
In `src/app/page.tsx` under the return statement:
Replace:
```tsx
<ChristmasHeroBanner products={prunedChristmasProducts} ... />
```
With:
```tsx
<HeroShelf
  products={prunedFeatured}
  badge={curated.heroBadge}
  title={curated.heroTitle}
  subtitle={curated.heroSubtitle}
/>
```
